import { Router } from 'express';
import { searchUsers } from '../api/controllers/participantController';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get('/search', searchUsers);
