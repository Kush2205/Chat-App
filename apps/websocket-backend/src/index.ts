import { WebSocket } from "ws";
import { prisma } from "@repo/database/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";
const wss = new WebSocket.Server({ port: 8080 });
const secret = JWT_SECRET;
interface user {
    id: string;
    ws: WebSocket;
    rooms: string[];
}

interface room {
    id: string,
    name?: string;
    users: string[];
}

const rooms: room[] = [];
const users: user[] = [];

wss.on("connection", ws => {

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message.toString());
            
            if (data.command === "join-room") {
                const { roomId, token } = data;
                const userValid = jwt.verify(token, secret);
                if (!userValid) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    ws.close();
                    return;
                }

                const roomExist = await prisma.rooms.findFirst({
                    where: {
                        id: roomId
                    },
                    include: {
                        messages: true
                    }
                });

                if (!roomExist) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Room not found"
                    }));
                    ws.close();
                    return;
                }
                const user = users.find(user => user.ws === ws);
                if (user) {
                    user.rooms.push(roomId);
                } else {
                    users.push({
                        id: (userValid as JwtPayload).id,
                        ws,
                        rooms: [roomId]
                    });
                }

                const room = rooms.find(room => room.id === roomId);
                if (room) {
                    room.users.push((userValid as JwtPayload).id);
                } else {
                    rooms.push({
                        id: roomId,
                        users: [(userValid as JwtPayload).id],
                        name: roomExist.slug
                    });
                }

                const messages = roomExist.messages.map(message => {
                    return {
                        id: message.id,
                        content: message.content,
                        user: message.senderId,
                        createdAt: message.createdAt
                    };
                });

                ws.send(JSON.stringify({
                    command: "room-joined",
                    messages
                }));
            }
            
            if (data.command === "leave-room") {
                const { roomId, token } = data;
                const userValid = jwt.verify(token, secret);
                if (!userValid) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    ws.close();
                    return;
                }

                const room = rooms.find(room => room.id === roomId);
                if (room) {
                    const user = users.find(user => user.id === (userValid as JwtPayload).id);
                    if (user) {
                        user.rooms = user.rooms.filter(room => room !== roomId);
                    }
                    room.users = room.users.filter(user => user !== (userValid as JwtPayload).id);
                }
            }
            
            if (data.command === "message") {
                const { roomId, token, content } = data;
                const userValid = jwt.verify(token, secret);
                if (!userValid) {
                    ws.send(JSON.stringify({
                        command: "error",
                        message: "Invalid token"
                    }));
                    ws.close();
                    return;
                }

                const room = rooms.find(room => room.id === roomId);
                if (room) {
                    const user = users.find(user => user.id === (userValid as JwtPayload).id);
                    if (user) {
                        const messageEntity = await prisma.messages.create({
                            data: {
                                content,
                                senderId: user.id,
                                roomId,
                            }
                        });
                        room.users.forEach(userId => {
                            const usr = users.find(user => user.id === userId);
                            if (usr) {
                                usr.ws.send(JSON.stringify({
                                    command: "message",
                                    message: {
                                        id: messageEntity.id,
                                        content: messageEntity.content,
                                        user: (userValid as JwtPayload).name,
                                        createdAt: messageEntity.createdAt
                                    }
                                }));
                            }
                        });
                    }
                }
            }
        } catch (error) {
            ws.send(JSON.stringify({
                command: "error",
                message: "Internal server error"
            }));
            ws.close();
            console.error("Error processing message:", error);
        }
    });

});