import { WebSocket, Server} from "ws";
import { User } from "../User/index";
import {Room} from "../Room/index";

export class Handler {
    
    private users: User[]
    private rooms: Room[]

    constructor(users: User[], rooms: Room[]){
        this.users = users;
        this.rooms = rooms;
    }

    public handleConnection(ws: WebSocket){
       ws.on("message", (message: string) => {
        const {command , userId , roomId , msg , roomname , username} = JSON.parse(message);
             
        switch(command){
            case "connect" : this.handleUserConnection(userId, username, ws);
            break;
            case "joinRoom":
                this.handleJoinRoom(userId, roomId, ws);
                break;
            case "leaveRoom":
                this.handleLeaveRoom(userId, roomId , ws);
                break;
            case "createRoom":
                this.handleCreateRoom(userId, roomId , roomname , ws);
                break;
            case "message":
                this.handleMessage(userId, roomId, msg);
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

    private handleCreateRoom(userId: string, roomId: string , roomname: string , ws: WebSocket){
        const user = this.users.find(user => user.id === userId);
        if(user){
            user.createRoom(roomId);
            this.rooms.push(new Room(roomId, roomname, [user]));
            this.users.push(user);
            ws.send(JSON.stringify({message: `Room ${roomname} created`}));
        }
    }

    private handleMessage(userId: string, roomId: string, msg: string){
        const user = this.users.find(user => user.id === userId);
        const room = this.rooms.find(room => room.id === roomId);
        if(user && room){
            room.broadcastMessage(msg, userId);
            user.ws.send(JSON.stringify({ message: msg, from: user.name, time: new Date().toLocaleTimeString() }));
        }
    }

}
