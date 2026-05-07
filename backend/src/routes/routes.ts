import {Router} from 'express';
import { register,login } from '../controllers';
import { authRouter } from './auth';

export const routes = Router();

routes.use(authRouter)
