import { query } from '../config/db';
import { keysToCamel } from '../utils';
import { Meeting, CreateMeetingInput, UpdateMeetingInput } from '../types/meeting';

export const createMeeting = async (input: CreateMeetingInput): Promise<Meeting> => {
    const { title, description, startTime, endTime, organizerId } = input;
    const sql = `
        INSERT INTO meetings (title, description, start_time, end_time, organizer_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const result = await query(sql, [title, description, startTime, endTime, organizerId]);
    return keysToCamel(result.rows[0]);
};

export const getMeetingById = async (id: string): Promise<Meeting | null> => {
    const sql = `SELECT * FROM meetings WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const getMeetingsByUserId = async (userId: string): Promise<Meeting[]> => {
    const sql = `SELECT * FROM meetings WHERE organizer_id = $1 ORDER BY start_time ASC`;
    const result = await query(sql, [userId]);
    return result.rows.map(row => keysToCamel(row));
};

export const updateMeeting = async (id: string, input: UpdateMeetingInput): Promise<Meeting | null> => {
    const fields = Object.keys(input)
        .map((key, index) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${snakeKey} = $${index + 2}`;
        })
        .join(', ');
    
    if (!fields) return null;

    const values = Object.values(input);
    const sql = `
        UPDATE meetings 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
    `;
    const result = await query(sql, [id, ...values]);
    return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
    const sql = `DELETE FROM meetings WHERE id = $1`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
};
