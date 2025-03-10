import { authRouter } from "./authRouter";
import { drawRouter } from "./drawRoute";
import express from 'express';
import { Router } from 'express';

export const mainRouter:express.Router = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/draw', drawRouter);