import { authRouter } from "./authRouter";
import { pingRouter } from "./pingRouter";
import { roomRouter } from "./roomRoute";
import express from 'express';
import { Router } from 'express';

export const mainRouter:express.Router = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/room', roomRouter);
mainRouter.use('/ping' ,pingRouter );