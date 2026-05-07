import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { createUser, findUserByEmail, validatePassword } from '../models/User';
import { createRefreshToken, findRefreshToken, deleteRefreshToken, deleteAllUserRefreshTokens } from '../models/RefreshToken';
import { registerSchema, loginSchema } from '../validators/authValidators';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

const generateAccessToken = (userId: string, email: string): string => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '15m' });
};

export const register = async (req: Request, res: Response) => {
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
            first_name: firstName,
            last_name: lastName,
            email,
            password
        });

        res.status(StatusCodes.CREATED).json({
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
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
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Refresh token is required' });
        }

        const storedToken = await findRefreshToken(refreshToken);
        if (!storedToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await findUserByEmail('');
        // Look up user by ID from the stored token
        const { query } = await import('../config/db');
        const result = await query('SELECT id, email FROM users WHERE id = $1', [storedToken.user_id]);
        const tokenUser = result.rows[0];

        if (!tokenUser) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' });
        }

        await deleteRefreshToken(refreshToken);
        const newRefreshToken = await createRefreshToken(tokenUser.id);
        const accessToken = generateAccessToken(tokenUser.id, tokenUser.email);

        res.status(StatusCodes.OK).json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }

        res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};
