import express from 'express';
import { Router } from 'express';
const pingRouter :Router = Router();

pingRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

export { pingRouter };
