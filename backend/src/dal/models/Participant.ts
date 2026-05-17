import { query } from "../../config/db";
import { keysToCamel } from "../../utils";
import { Participant, ParticipationStatus } from "../../types/meeting";

export const addParticipant = async (
  meetingId: string,
  userId: string,
): Promise<Participant> => {
  const sql = `
        INSERT INTO participants (meeting_id, user_id, status)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
  const result = await query(sql, [
    meetingId,
    userId,
    ParticipationStatus.PENDING,
  ]);
  return keysToCamel(result.rows[0]);
};

export const getMeetingParticipants = async (
  meetingId: string,
): Promise<Participant[]> => {
  const sql = `
        SELECT p.*, u.first_name, u.last_name, u.email
        FROM participants p
        JOIN users u ON p.user_id = u.id
        WHERE p.meeting_id = $1
    `;
  const result = await query(sql, [meetingId]);
  return result.rows.map((row) => {
    const camelRow = keysToCamel(row);
    return {
      ...camelRow,
      user: {
        firstName: camelRow.firstName,
        lastName: camelRow.lastName,
        email: camelRow.email,
      },
    };
  });
};

export const updateParticipantStatus = async (
  meetingId: string,
  userId: string,
  status: ParticipationStatus,
): Promise<Participant | null> => {
  const sql = `
        UPDATE participants
        SET status = $3, updated_at = NOW()
        WHERE meeting_id = $1 AND user_id = $2
        RETURNING *
    `;
  const result = await query(sql, [meetingId, userId, status]);
  return result.rows[0] ? keysToCamel(result.rows[0]) : null;
};

export const getUserInvitations = async (userId: string): Promise<any[]> => {
  const sql = `
        SELECT p.meeting_id , p.id , m.title, m.start_time, m.end_time, m.address, u.first_name as organizer_first_name, u.last_name as organizer_last_name
        FROM participants p
        JOIN meetings m ON p.meeting_id = m.id
        JOIN users u ON m.organizer_id = u.id
        WHERE p.user_id = $1 AND p.status = $2
        ORDER BY m.start_time ASC
    `;
  const result = await query(sql, [userId, ParticipationStatus.PENDING]);
  return result.rows.map((row) => keysToCamel(row));
};

export const removeParticipant = async (
  meetingId: string,
  userId: string,
): Promise<boolean> => {
  const sql = `DELETE FROM participants WHERE meeting_id = $1 AND user_id = $2`;
  const result = await query(sql, [meetingId, userId]);
  return (result.rowCount ?? 0) > 0;
};
