import bcrypt from 'bcryptjs';
import { query } from '../config/db';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    created_at: Date;
}

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const { first_name, last_name, email, password } = userData;
    
    if (!password) {
        throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, created_at
    `;
    
    const result = await query(sql, [first_name, last_name, email, hashedPassword]);
    return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
};

export const validatePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
