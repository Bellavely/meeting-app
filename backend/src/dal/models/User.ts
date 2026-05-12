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

export const updateUser = async (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<User> => {
  const sql = `
    UPDATE users 
    SET first_name = $1, last_name = $2, email = $3 
    WHERE id = $4 
    RETURNING id, first_name, last_name, email, created_at;
  `;
  const result = await query(sql, [firstName, lastName, email, id]);
  return keysToCamel(result.rows[0]);
};

export const searchUsers = async (searchTerm: string, limit: number = 10): Promise<User[]> => {
    const sql = `
        SELECT id, first_name, last_name, email, created_at 
        FROM users 
        WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
        LIMIT $2
    `;
    const result = await query(sql, [`%${searchTerm}%`, limit]);
    return result.rows.map(row => keysToCamel(row));
};