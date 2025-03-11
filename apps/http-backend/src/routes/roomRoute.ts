import express, { Router, Request, Response, NextFunction } from 'express';
import { CreateRoomSchema } from '@repo/common/config';
import { prisma } from '@repo/database/config';
import { authMiddleware } from '../middleware/authMiddleware';
export const roomRouter:express.Router = express.Router();


interface CustomRequest extends Request{
    id: string
}

roomRouter.post('/create',authMiddleware, async (req: Request, res: Response) => {
    try {
        const {name} = req.body;
        const admin = req.body.username
        const roomExists = await prisma.rooms.findFirst({
            where : {
                slug : name
            }
        })
        if(roomExists){
            res.status(400).json({error: "Room already exists"});
            return;
        }
        const status = CreateRoomSchema.safeParse({name});
        if(status.success){
            const room = await prisma.rooms.create({
                data:{
                    id : Math.random().toString(36).substring(7),
                    slug : name,
                    admin : admin
                }
            });
            if(room){
                res.status(200).json({room});
            }
           
        }
        else{
            res.status(400).json({error: status.error});
        }
       
      
    } catch (error) {
        res.status(500).json({error: error});
    }
})

