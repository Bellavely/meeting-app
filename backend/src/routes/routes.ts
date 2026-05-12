import { Router } from 'express';
import { authRouter } from './auth';
import { meetingRouter } from './meetingRoutes';
import { userRouter } from './userRoutes';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/meetings', meetingRouter);
routes.use('/users', userRouter);