import bcrypt from 'bcryptjs';
import { query } from '../../config/db';
import { keysToCamel } from '../../utils';
import { User } from '../../types';

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const { firstName, lastName, email, password } = userData;
    
    if (!password) {
        throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, created_at
    `;
    
    const result = await query(sql, [firstName, lastName, email, hashedPassword]);
    return keysToCamel(result.rows[0]);
};

export const findUserById = async (id: string): Promise<User | null> => {
    const sql = `SELECT id, first_name, last_name, email, created_at FROM users WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const validatePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

//create an update user 
// export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {}