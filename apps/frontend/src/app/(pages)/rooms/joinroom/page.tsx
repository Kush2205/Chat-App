"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {jwtDecode} from "jwt-decode"
import { Loader } from "@repo/ui/loader"
import axios from "axios"

interface JwtPayload {
  id: string;
  name: string;
}

export default function RoomCodePage() {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL
  const router = useRouter()
  const [roomCode, setRoomCode] = useState<string>("")
  const [roomName, setRoomName] = useState<string>("")
  const [joinCode, setJoinCode] = useState<string>("")
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: string } | null>(null)
  const [adminName, setAdminName] = useState<string>("")
  const [error , setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      setAdminName(decoded.name)
    } catch (error) {
      console.error("Token decoding failed:", error)
      router.push("/auth/signin")
    }
   
    
  }, [])

  const generateRoomCode = () => {
    if (roomName.trim() === "") {
      showToast("Please enter a room name", "error")
      return
    }
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setRoomCode(result)
    showToast(`Room code generated: ${result} for room "${roomName}"`, "success")
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    showToast("Room code copied to clipboard", "info")
  }

 
  const joinRoomAPI = async () => {
    if (roomCode.trim() === "" || roomName.trim() === "") {
      showToast("Room code and room name are required", "error")
      return
    }
    
    setJoinedRoom(roomCode)
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const room = await axios.post(
        `${url}/api/room/create`,
        {
          roomId: roomCode,
          name: roomName,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      showToast(`Room:${roomCode} created`, "success")
      router.push(`/rooms/chatroom/?room=${roomCode}`)
    } catch (error : any) {
      setLoading(false)
       showToast(error?.response?.data?.error, "error")
    }
    finally{
      setLoading(false)
    }
   
  }

  
  const joinRoomSocket =async () => {
    if (joinCode.trim() === "") {
      showToast("Please enter a room code", "error")
      return
    }
    try{
      setLoading(true)
      const token = localStorage.getItem("token")
      const room = await axios.post(
        `${url}/api/room/join`,
        {
          roomId: joinCode,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      if(room.data.room){
        showToast(`Joined room: ${joinCode}`, "success")
        localStorage.setItem("messages", JSON.stringify(room.data.messages))
        router.push(`/rooms/chatroom/?room=${joinCode}`)
      }else{
        showToast(`Room not found`, "error")
      }
    }catch{
      setLoading(false)
      showToast("Room not found", "error")
    }
    finally{
      setLoading(false)
    }
  }

  const showToast = (message: string, type: string) => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  return (
    <div
      className="w-full h-screen"
      style={{
        backgroundImage: `url("https://img.freepik.com/premium-vector/hand-drawn-ink-chat-bubble-set-pattern_1027691-779.jpg?w=740")`,
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-6xl mx-auto py-24">
        {toast && toast.visible && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-md transition-all ${
              toast.type === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : toast.type === "error"
                  ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                  : "bg-gray-100 text-gray-800 border-l-4 border-black"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Generate Room Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Generate Room</h2>
              <p className="text-gray-500 text-sm mt-1">
                Create a new room and share the code with others
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                  Room Name
                </label>
                <input
                  id="roomName"
                  type="text"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                  Admin Name
                </label>
                <input
                  id="adminName"
                  type="text"
                  value={adminName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800"
                />
              </div>
              {roomCode && (
                <div className="p-4 bg-gray-100 rounded-md flex items-center justify-between mb-4">
                  <span className="text-xl font-mono font-bold">{roomCode}</span>
                  <button
                    onClick={copyRoomCode}
                    className="p-2 hover:bg-gray-200 rounded-full"
                    aria-label="Copy room code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-around gap-x-3">
              <button
                onClick={generateRoomCode}
                className="w-[45%] bg-black hover:bg-black/90 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                Generate Room Code
              </button>
              <button
                onClick={joinRoomAPI}
                className="w-[45%] flex items-center justify-center bg-black hover:bg-black/90 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                Create Room
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Join Room</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter a room code to join an existing room
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code (e.g., ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              {joinedRoom && (
                <div className="p-4 bg-gray-100 text-gray-800 rounded-md">
                  <p className="text-sm font-medium">
                    Currently in room: <span className="font-bold">{joinedRoom}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={joinRoomSocket}
                className="w-full flex items-center justify-center bg-black hover:bg-black/90 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Join Room
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
}