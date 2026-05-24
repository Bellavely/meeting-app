import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export type DBClient = Pool | PoolClient;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '6543'),
  max: 10,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();