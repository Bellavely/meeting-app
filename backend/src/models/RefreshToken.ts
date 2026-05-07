import crypto from 'crypto';
import { query } from '../config/db';
import { keysToCamel } from '../utils';
import { RefreshToken } from '../types';

export const createRefreshToken = async (userId: string, expiresInDays = 30): Promise<string> => {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const sql = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING token
    `;

    await query(sql, [userId, token, expiresAt]);
    return token;
};

export const updateRefreshToken = async (userId:string , token: string) => {

    const sql = `
        UPDATE refresh_tokens SET token = $1 WHERE user_id = $2
        RETURNING token
    `;

    await query(sql, [token, userId]);
};

export const findRefreshToken = async (token: string): Promise<RefreshToken | null> => {
    const sql = `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`;
    const result = await query(sql, [token]);
    return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};

export const deleteAllUserRefreshTokens = async (userId: string): Promise<void> => {
    await query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
};
