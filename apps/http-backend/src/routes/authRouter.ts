import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from "@repo/database/client";


export const authRouter:express.Router = express.Router();

authRouter.post('/signin', (req: Request, res: Response) => {
  res.send('Login route');
});

authRouter.post('/signup', (req: Request, res: Response) => {
  res.send('Register route');
});
