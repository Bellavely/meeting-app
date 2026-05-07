import { Router } from 'express';
import { authRouter } from './auth';

export const routes = Router();

routes.use('/auth',authRouter);