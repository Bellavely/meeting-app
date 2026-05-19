import { query, DBClient, pool } from "../../config/db";
import { keysToCamel } from "../../utils";
import {
  Meeting,
  CreateMeetingInput,
  UpdateMeetingInput,
} from "../../types/meeting";

export const createMeeting = async (
  input: CreateMeetingInput,
  client: DBClient = pool,
): Promise<Meeting> => {
  const {
    title,
    description,
    startTime,
    endTime,
    address,
    latitude,
    longitude,
    organizerId,
  } = input;
  const sql = `
        INSERT INTO meetings (title, description, start_time, end_time, address, latitude, longitude, organizer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
  const result = await client.query(sql, [
    title,
    description,
    startTime,
    endTime,
    address,
    latitude,
    longitude,
    organizerId,
  ]);
  return keysToCamel(result.rows[0]);
};

export const getMeetingsByCalendar = async (userId: string, month: string) => {
  const sql = `SELECT DISTINCT m.* FROM meetings as m
  LEFT JOIN Participants as p on  p.meeting_id = m.id
  WHERE  m.organizer_id =$1 or (p.user_id = $1 AND p.status = 'ACCEPTED') 
  and start_time >= to_date( $2, 'YYYY-MM')
  AND start_time < to_date( $2, 'YYYY-MM') + INTERVAL '1 month'
  ORDER BY m.start_time ASC`;
  const result = await query(sql, [userId, month]);
  const meetings = result.rows.map((row) => keysToCamel(row));
  return { meetings };
};

export const getMeetingById = async (id: string): Promise<Meeting | null> => {
  const sql = `SELECT * FROM meetings WHERE id = $1`;
  const result = await query(sql, [id]);
  return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const getMeetingsByUserId = async (
  userId: string,
  filters: {
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ meetings: Meeting[]; totalCount: number }> => {
  let whereClauses = [
    `(m.organizer_id = $1 OR (p.user_id = $1 AND p.status = 'ACCEPTED'))`,
  ];
  const values: any[] = [userId];
  let paramCount = 1;

  if (filters.search) {
    paramCount++;
    whereClauses.push(
      `(m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`,
    );
    values.push(`%${filters.search}%`);
  }

  const whereSql = whereClauses.join(" AND ");

  // Get total count first
  const countSql = `
    SELECT COUNT(DISTINCT m.id) 
    FROM meetings m
    LEFT JOIN participants p ON m.id = p.meeting_id
    WHERE ${whereSql}
  `;
  const countResult = await query(countSql, values);
  const totalCount = parseInt(countResult.rows[0].count);

  // Get paginated results
  let sql = `
    SELECT DISTINCT m.* 
    FROM meetings m
    LEFT JOIN participants p ON m.id = p.meeting_id
    WHERE ${whereSql} 
    ORDER BY m.start_time ASC
  `;

  if (filters.limit !== undefined) {
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    values.push(filters.limit);
  }

  if (filters.offset !== undefined) {
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    values.push(filters.offset);
  }

  const result = await query(sql, values);
  const meetings = result.rows.map((row) => keysToCamel(row));

  return { meetings, totalCount };
};

export const updateMeeting = async (
  id: string,
  input: UpdateMeetingInput,
  client: DBClient = pool,
): Promise<Meeting | null> => {
  const fields = Object.keys(input)
    .map((key, index) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      return `${snakeKey} = $${index + 2}`;
    })
    .join(", ");

  if (!fields) return null;

  const values = Object.values(input);
  const sql = `
        UPDATE meetings 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
    `;
  const result = await client.query(sql, [id, ...values]);
  return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  const sql = `DELETE FROM meetings WHERE id = $1`;
  const result = await query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
};

export const isDoubleBooked = async (
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeMeetingId?: string,
): Promise<boolean> => {
  let sql = `SELECT COUNT(*) FROM meetings m
    LEFT JOIN participants p ON m.id = p.meeting_id
    WHERE (m.organizer_id = $1 OR (p.user_id = $1 AND p.status = 'ACCEPTED'))
    AND m.start_time < $3 AND m.end_time > $2`;
  let results;
  if (excludeMeetingId) {
    sql += ` AND m.id != $4`;
    results = await query(sql, [userId, startTime, endTime, excludeMeetingId]);
  } else {
    results = await query(sql, [userId, startTime, endTime]);
  }
  return results.rows[0].count > 0;
};
