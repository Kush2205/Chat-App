import { WebSocket } from "ws";
import { prisma } from "@repo/database/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

const wss = new WebSocket.Server({ port: 8080 });
const secret = JWT_SECRET;

interface User {
    id: string;
    name: string;  // Add name for better identification
    ws: WebSocket;
    rooms: string[];
}

interface Room {
    id: string;
    name?: string;
    users: string[];  // User IDs
}

const rooms: Room[] = [];
const users: User[] = [];

// Helper function to broadcast a message to all users in a room
const broadcastToRoom = (roomId: string, message: any) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    room.users.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (user && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify(message));
        }
    });
};

wss.on("connection", ws => {
    console.log("New client connected");
    
    // Handle client disconnection
    ws.on("close", () => {
        const userIndex = users.findIndex(user => user.ws === ws);
        if (userIndex !== -1) {
            const userToRemove = users[userIndex];
            
            // Only proceed if we have a valid user
            if (userToRemove) {
                // Remove user from all rooms they were in
                userToRemove.rooms.forEach(roomId => {
                    const room = rooms.find(r => r.id === roomId);
                    if (room) {
                        room.users = room.users.filter(uid => uid !== userToRemove.id);
                        
                        // Notify others that user has left
                        broadcastToRoom(roomId, {
                            command: "user-left",
                            userId: userToRemove.id,
                            userName: userToRemove.name
                        });
                    }
                });
                
                // Remove user from users array
                users.splice(userIndex, 1);
                console.log(`User ${userToRemove.id} disconnected`);
            }
        }
    });

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log("Received message:", data.command);
            
            if (data.command === "join-room") {
                const { roomId, token } = data;
                
                if (!token) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Token is required"
                    }));
                    return;
                }
                
                let userValid;
                try {
                    userValid = jwt.verify(token, secret);
                } catch (e) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    return;
                }

                const roomExist = await prisma.rooms.findFirst({
                    where: {
                        id: roomId
                    },
                    include: {
                        messages: {
                            orderBy: {
                                createdAt: 'asc'
                            },
                            take: 50 // Limit to last 50 messages
                        }
                    }
                });

                if (!roomExist) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Room not found"
                    }));
                    return;
                }

                // Make sure we have a valid JWT payload
                if (!userValid || typeof userValid !== 'object' || !('id' in userValid)) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid user token"
                    }));
                    return;
                }

                const userId = (userValid as JwtPayload).id;
                const userName = (userValid as JwtPayload).name || "Unknown";

                // Find or create user
                let user = users.find(user => user.id === userId);
                if (user) {
                    // User exists but may be reconnecting with a new websocket
                    if (!user.rooms.includes(roomId)) {
                        user.rooms.push(roomId);
                    }
                    // Update the websocket connection
                    user.ws = ws;
                } else {
                    // Create new user
                    user = {
                        id: userId,
                        name: userName,
                        ws,
                        rooms: [roomId]
                    };
                    users.push(user);
                }

                // Find or create room
                let room = rooms.find(room => room.id === roomId);
                if (room) {
                    if (!room.users.includes(user.id)) {
                        room.users.push(user.id);
                    }
                } else {
                    room = {
                        id: roomId,
                        users: [user.id],
                        name: roomExist.slug
                    };
                    rooms.push(room);
                }

                // Notify others that a new user has joined
                broadcastToRoom(roomId, {
                    command: "user-joined",
                    userId: user.id,
                    userName: user.name
                });

                // Send room history to the user
                ws.send(JSON.stringify({
                    command: "room-joined",
                    room: {
                        id: roomId,
                        name: roomExist.slug
                    },
                    messages: roomExist.messages.map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        senderId: msg.senderId,
                        // Add sender name if available in your database
                        createdAt: msg.createdAt,
                        roomId: msg.roomId
                    }))
                }));
            }
            
            else if (data.command === "leave-room") {
                const { roomId, token } = data;
                
                let userValid;
                try {
                    userValid = jwt.verify(token, secret);
                } catch (e) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    return;
                }

                // Make sure we have a valid JWT payload
                if (!userValid || typeof userValid !== 'object' || !('id' in userValid)) {
                    return;
                }

                const userId = (userValid as JwtPayload).id;

                const room = rooms.find(room => room.id === roomId);
                if (room) {
                    const user = users.find(user => user.id === userId);
                    if (user) {
                        user.rooms = user.rooms.filter(r => r !== roomId);
                        room.users = room.users.filter(u => u !== user.id);
                        
                        // Notify others that user has left
                        broadcastToRoom(roomId, {
                            command: "user-left",
                            userId: user.id,
                            userName: user.name
                        });
                    }
                }
                
                ws.send(JSON.stringify({
                    command: "room-left",
                    roomId
                }));
            }
            
            else if (data.command === "message") {
                const { roomId, token, content, userName } = data;
                
                let userValid;
                try {
                    userValid = jwt.verify(token, secret);
                } catch (e) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    return;
                }

                // Make sure we have a valid JWT payload
                if (!userValid || typeof userValid !== 'object' || !('id' in userValid)) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid user token"
                    }));
                    return;
                }

                const userId = (userValid as JwtPayload).id;
                const jwtUserName = (userValid as JwtPayload).name;

                const room = rooms.find(room => room.id === roomId);
                if (!room) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Room not found"
                    }));
                    return;
                }

                const user = users.find(user => user.id === userId);
                if (!user) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "User not found"
                    }));
                    return;
                }

                // Save message to database
                try {
                    const messageEntity = await prisma.messages.create({
                        data: {
                            content,
                            senderId: user.id,
                            roomId,
                        }
                    });
                    
                    // Broadcast message to all users in the room
                    broadcastToRoom(roomId, {
                        command: "message",
                        message: {
                            id: messageEntity.id,
                            content: messageEntity.content,
                            senderId: user.id,
                            senderName: userName || jwtUserName || "Unknown",
                            createdAt: messageEntity.createdAt,
                            roomId: messageEntity.roomId
                        }
                    });
                } catch (dbError) {
                    console.error("Database error:", dbError);
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Failed to save message"
                    }));
                }
            }
            
            else {
                ws.send(JSON.stringify({
                    command: "error",
                    message: "Unknown command"
                }));
            }
            
        } catch (error) {
            console.error("Error processing message:", error);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    command: "error",
                    message: "Internal server error"
                }));
            }
        }
    });
});

console.log("WebSocket server started on port 8080");