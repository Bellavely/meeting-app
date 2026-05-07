import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { createUser, findUserByEmail, getUserById, validatePassword } from '../models/User';
import { createRefreshToken, findRefreshToken, deleteRefreshToken, updateRefreshToken } from '../models/RefreshToken';
import { registerSchema, loginSchema } from '../validators/authValidators';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

const generateAccessToken = (userId: string, email: string): string => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '15m' });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { firstName, lastName, email, password } = parsed.data;

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
        }

        const user = await createUser({
            firstName,
            lastName,
            email,
            password
        });

        res.status(StatusCodes.CREATED).json({
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const { email, password } = parsed.data;

        const user = await findUserByEmail(email);
        if (!user || !user.password) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user.id, user.email);
        const refreshToken = await createRefreshToken(user.id);

        res.status(StatusCodes.OK).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Refresh token is required' });
        }

        const storedToken = await findRefreshToken(refreshToken);
        if (!storedToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired refresh token' });
        }

        const tokenUser = await getUserById(storedToken.userId)

        if (!tokenUser) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }

        await updateRefreshToken(storedToken.id, refreshToken);
        const newRefreshToken = await createRefreshToken(tokenUser.id);
        const accessToken = generateAccessToken(tokenUser.id, tokenUser.email);

        res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(StatusCodes.OK).json({ accessToken        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }

        res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};


