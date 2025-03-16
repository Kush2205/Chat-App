import { WebSocket, Server} from "ws";
import { User } from "../User/index";
import {Room} from "../Room/index";
import {prisma} from "@repo/database/config"
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "@repo/common-backend/config"
export class Handler {
    
    private users: User[]
    private rooms: Room[]
    
    constructor(users: User[], rooms: Room[]){
        this.users = users;
        this.rooms = rooms;
        
    }

    public handleConnection(ws: WebSocket){
       ws.on("message", (message: string) => {
        const {command , roomId , msg , roomname , username , token} = JSON.parse(message);
        let userID
        try{
            const decoded = jwt.verify(token,JWT_SECRET);
            userID = (decoded as JwtPayload).id;
            if(!decoded){
               ws.send(JSON.stringify({error: "Invalid token"}));
               
               return;
            }
        } catch (err){
            ws.send(JSON.stringify({err}));
            return;
        }
         
        switch(command){
            case "connect" : this.handleUserConnection(userID, username, ws);
            break;
            case "joinRoom":
                this.handleJoinRoom(userID, roomId, ws);
                break;
            case "leaveRoom":
                this.handleLeaveRoom(userID, roomId , ws);
                break;
            case "createRoom":
                this.handleCreateRoom(userID, roomId , roomname , ws);
                break;
            case "message":
                this.handleMessage(userID, roomId, msg);
                break;
            default:
                ws.send(JSON.stringify({error: "Invalid command"}));
        }
            
       });


    }

    private handleUserConnection(userId: string, username: string, ws: WebSocket){
        const user = new User(userId, username, ws);
         if(!this.users.find(user => user.id === userId)){
            this.users.push(user);
            ws.send(JSON.stringify({message: `User ${username} connected`}));
         }
            else{
                ws.send(JSON.stringify({error: "User already connected"}));
            }
        
    }

    private handleJoinRoom(userId: string, roomId: string, ws: WebSocket){
        const user = this.users.find(user => user.id === userId);
        const room = this.rooms.find(room => room.id === roomId);
        if(room && user){
            user?.joinRoom(roomId);
            room.addUser(user);
            ws.send(JSON.stringify({message: `User ${user.name} joined room ${room.name}`}));
            room.broadcastMessage(`User ${user.name} joined room` , userId);
        }
        else{
            ws.send(JSON.stringify({error: "User or room not found"}));
        }
    }

    private handleLeaveRoom(userId: string, roomId: string , ws: WebSocket){
        const user = this.users.find(user => user.id === userId);
        const room = this.rooms.find(room => room.id === roomId);
        if(user && room){
            user.leaveRoom(roomId);
            room.removeUser(user);
            ws.send(JSON.stringify({message: `User ${user.name} left room ${room.name}`}));
        }
    }

    private async handleCreateRoom(userId: string, roomId: string , roomname: string , ws: WebSocket){
        const user = this.users.find(user => user.id === userId);
        if(user){
            try {
                const room = await prisma.rooms.findUnique({
                    where: {
                        id: roomId
                    }
                })
                if(room){
                    ws.send(JSON.stringify({error: `Room ${roomname} already exists`}));
                    return;
                }
                await prisma.rooms.create({
                    data: {
                        id: roomId,
                        slug: roomname,
                        admin: user.name
                }})
                user.createRoom(roomId);
                this.rooms.push(new Room(roomId, roomname, [user]));
                this.users.push(user);
                ws.send(JSON.stringify({message: `Room ${roomname} created`}));
            } catch (error) {
                ws.send(JSON.stringify({error: "Error creating room"}));
                
            }
           
        }
    }

    private async handleMessage(userId: string, roomId: string, msg: string){
        const user = this.users.find(user => user.id === userId);
        const room = this.rooms.find(room => room.id === roomId);
        if(user && room){
              try {
                await prisma.messages.create({
                    data:{
                        roomId: roomId,
                        content: msg,
                        senderId: userId,
                    }
                })
                room.broadcastMessage(msg, userId);
                user.ws.send(JSON.stringify({ message: msg, from: user.name, time: new Date().toLocaleTimeString() }));
            
           
              } catch (error) {
                    user.ws.send(JSON.stringify({error: "Error sending message"}));
              }
                
        }
    }

}
