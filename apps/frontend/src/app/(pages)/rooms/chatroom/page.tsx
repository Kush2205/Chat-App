"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@repo/ui/modal";

interface JwtPayload {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface Message {
  id?: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  roomId: string;
}

export default function ChatRoom() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const [modal, setModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an error joining the room.");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

  // Function to manually parse JWT without external libraries
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return null;
    }
  };

  // Setup WebSocket connection
  const setupWebSocket = () => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setErrorMessage("Failed to connect after multiple attempts. Please refresh the page.");
      setModal(true);
      setLoading(false);
      return;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setLoading(false);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      
      // Join room
      if (roomId) {
        ws.send(
          JSON.stringify({
            command: "join-room",
            roomId: roomId,
            token: localStorage.getItem("token"),
          })
        );
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
      
      switch (data.command) {
        case "error":
          setErrorMessage(data.message || "An error occurred");
          setModal(true);
          break;
          
        case "room-joined":
          // Set messages from room history
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
          break;
          
        case "message":
          setMessages((prev) => [...prev, data.message]);
          break;
          
        case "user-joined":
          setActiveUsers((prev) => {
            if (!prev.some(user => user.id === data.userId)) {
              return [...prev, { id: data.userId, name: data.userName }];
            }
            return prev;
          });
          // Optional: Show a toast notification that a new user joined
          break;
          
        case "user-left":
          setActiveUsers((prev) => prev.filter(user => user.id !== data.userId));
          // Optional: Show a toast notification that a user left
          break;
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
      
      // Try to reconnect with exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          setupWebSocket();
        }, timeout);
      }
    };

    return ws;
  };

  // Load saved messages from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMessages = localStorage.getItem(`messages_${roomId}`);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Error loading saved messages:", error);
      }
    }
  }, [roomId]);

  // Load user info and theme preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get user ID from localStorage
      const storedUser = localStorage.getItem("username") || "";
      setCurrentUser(storedUser);
      
      // Get user info from token
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Parse JWT manually
          const decoded = parseJwt(token);
          if (decoded) {
            setUserName(decoded.name || storedUser);
            setCurrentUserId(decoded.id || "");
          } else {
            setUserName(storedUser);
          }
        } else {
          setUserName(storedUser);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUserName(storedUser); // Fallback to stored username
      }
      
      // Check for saved theme preference
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || 
          (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setDarkTheme(true);
      }
    }
  }, []);

  // Apply theme change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkTheme ? "dark" : "light");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", darkTheme ? "dark" : "light");
    }
  }, [darkTheme]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0 && roomId) {
      localStorage.setItem(`messages_${roomId}`, JSON.stringify(messages));
    }
  }, [messages, roomId]);

  // Setup WebSocket connection
  useEffect(() => {
    const ws = setupWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send leave-room before closing
        if (roomId) {
          ws.send(
            JSON.stringify({
              command: "leave-room",
              roomId: roomId,
              token: localStorage.getItem("token"),
            })
          );
        }
        ws.close();
      }
    };
  }, [url, roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message function
  const sendMessage = () => {
    if (message.trim() === "") return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId) {
      wsRef.current.send(
        JSON.stringify({
          command: "message",
          roomId: roomId,
          content: message,
          userName: userName,
          token: localStorage.getItem("token"),
        })
      );
      
      // Don't add optimistic message as the server will echo it back
      // This prevents duplicate messages
      setMessage("");
    } else if (!connected) {
      setErrorMessage("You're disconnected. Please wait for reconnection or refresh the page.");
      setModal(true);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    setDarkTheme((prev) => !prev);
  };

  // Helper function to get first letter of a name
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };
  
  // Helper function to get sender display name
  const getSenderName = (msg: Message) => {
    return msg.senderName || msg.senderId || "Unknown";
  };

  // Helper to format timestamp
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="navbar bg-base-300 shadow-lg">
        <div className="navbar-start">
          <a className="btn btn-ghost normal-case text-xl">ExcaliDraw Chat</a>
        </div>
        <div className="navbar-center">
          <div className="badge badge-lg">{roomId}</div>
          {!connected && (
            <div className="badge badge-warning ml-2">Disconnected</div>
          )}
        </div>
        <div className="navbar-end flex gap-2">
          <div className="avatar placeholder">
            <div className="bg-primary text-base-100 rounded-full w-8">
              <span>{getInitial(userName)}</span>
            </div>
          </div>
          <span className="badge badge-outline hidden md:inline">{userName}</span>
          <button onClick={toggleTheme} className="btn btn-circle btn-sm">
            {darkTheme ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 bg-base-200 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(100vh - 136px)" }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-2">Connecting to room...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-base-content opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>No messages yet. Start the conversation!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat ${
                      // Compare with both ID and senderId since the server might use either
                      msg.senderId === currentUserId || msg.senderId === currentUser ? "chat-end" : "chat-start"
                    }`}
                  >
                    <div className="chat-image avatar placeholder">
                      <div className={`${
                        msg.senderId === currentUserId || msg.senderId === currentUser ? "bg-primary" : "bg-secondary"
                      } text-base-100 rounded-full w-10`}>
                        <span>{getInitial(getSenderName(msg))}</span>
                      </div>
                    </div>
                    <div className="chat-header opacity-75 text-xs font-semibold">
                      {getSenderName(msg)}
                      <time className="ml-1 opacity-60">
                        {formatTime(msg.createdAt)}
                      </time>
                    </div>
                    <div className={`chat-bubble ${
                      msg.senderId === currentUserId || msg.senderId === currentUser ? "chat-bubble-primary" : "chat-bubble-secondary"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-base-100 p-4 border-t border-base-300">
          <div className="flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Type your message here..." : "Reconnecting..."}
              className="textarea textarea-bordered flex-1 h-12 resize-none"
              disabled={!connected || loading}
            />
            <button 
              onClick={sendMessage}
              disabled={!connected || loading || message.trim() === ""}
              className="btn btn-primary ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Modal isOpen={modal} title="Connection Error" onClose={() => setModal(false)}>
            <div className="p-4">
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button className="btn btn-primary w-full" onClick={() => setModal(false)}>Close</button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}