import { query } from "../../config/db";
import { keysToCamel } from "../../utils";

export const addParticipant = async (
  meetingId: string,
  userId: string,
  status: string = "pending",
) => {
  const sql = `
    INSERT INTO participants (meeting_id, user_id, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (meeting_id, user_id) DO NOTHING
    RETURNING *
  `;
  const result = await query(sql, [meetingId, userId, status]);
  return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const getParticipantsByMeetingId = async (meetingId: string) => {
  const sql = `
    SELECT p.id, p.meeting_id, p.user_id, p.status,
           u.first_name, u.last_name, u.email
    FROM participants p
    JOIN users u ON u.id = p.user_id
    WHERE p.meeting_id = $1
    ORDER BY u.first_name ASC
  `;
  const result = await query(sql, [meetingId]);
  return result.rows.map((row) => keysToCamel(row));
};

export const updateParticipantStatus = async (
  meetingId: string,
  userId: string,
  status: string,
) => {
  const sql = `
    UPDATE participants
    SET status = $3
    WHERE meeting_id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await query(sql, [meetingId, userId, status]);
  return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const removeParticipant = async (
  meetingId: string,
  userId: string,
) => {
  const sql = `DELETE FROM participants WHERE meeting_id = $1 AND user_id = $2`;
  const result = await query(sql, [meetingId, userId]);
  return (result.rowCount ?? 0) > 0;
};

export const getParticipantMeetings = async (userId: string) => {
  const sql = `
    SELECT m.*, p.status AS participant_status
    FROM participants p
    JOIN meetings m ON m.id = p.meeting_id
    WHERE p.user_id = $1
    ORDER BY m.start_time ASC
  `;
  const result = await query(sql, [userId]);
  return result.rows.map((row) => keysToCamel(row));
};
