import { Router } from 'express';
import { authRouter } from './auth';
import { meetingRouter } from './meetingRoutes';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/meetings', meetingRouter);