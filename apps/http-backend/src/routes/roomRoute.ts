import express, { Router, Request, Response } from 'express';
import { CreateRoomSchema } from '@repo/common/config';
import { prisma } from '@repo/database/config';
import { authMiddleware } from '../middleware/authMiddleware';

export const roomRouter: Router = express.Router();

roomRouter.post('/create', authMiddleware, async (req : Request ,res : Response) => {
  try {
    const { name, roomId } = req.body;
    const admin = req.body.username;

    // Validate required fields.
    if (!name || !roomId || !admin) {
       res.status(400).json({ error: "Missing required fields: name, roomId, and username are required." });
       return;
    }

    // Check if a room with the given ID already exists.
    const roomExists = await prisma.rooms.findFirst({
      where: { id: roomId }
    });
    if (roomExists) {
       res.status(400).json({ error: "Room already exists" });
       return;
    }

    // Check if the room name (slug) is already used.
    const slugExists = await prisma.rooms.findFirst({
      where: { slug: name }
    });
    if (slugExists) {
      res.status(400).json({ error: "Room name already exists" });
      return;
    }

    // Validate the room name using your schema.
    const status = CreateRoomSchema.safeParse({ name });
    if (!status.success) {
       res.status(400).json({
        error: "Invalid room name",
        details: status.error.errors
      });
      return;
    }

    // Create the room.
    const room = await prisma.rooms.create({
      data: {
        id: roomId,
        slug: name,
        admin: admin
      }
    });

    if (!room) {
       res.status(500).json({ error: "Room creation failed" });
       return
    }

     res.status(200).json({
      message: "Room created successfully",
      room: room
    });

  } catch (error) {
     res.status(500).json({ error: error instanceof Error ? error.message : error });
     return;
  }
});

roomRouter.post('/join', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { roomId } = req.body;
        const roomExist = await prisma.rooms.findFirst({
            where: {
                id: roomId
            }
        })
        if (!roomExist) {
            res.status(400).json({ error: "Room not found" });
            return;
        }
        const messages = await prisma.messages.findMany({
            where: {
                roomId: roomId
            },

            orderBy: {
                createdAt: 'desc'
            },
            take:50

        })
        res.status(200).json({ room:true,messages: messages });

    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : error });
        return;
    }
});