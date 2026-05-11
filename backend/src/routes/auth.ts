import { Router } from "express";
import { login, register, refresh, logout, updateUser } from "../api/controllers";
import { authMiddleware } from "../middleware";

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.put('/update', authMiddleware, updateUser)