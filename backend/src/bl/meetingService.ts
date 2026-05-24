import * as MeetingModel from "../dal/models/Meeting";
import * as UserModel from "../dal/models";
import * as ParticipantModel from "../dal/models/Participant";
import { getClient } from "../config/db";

import {
  CreateMeetingInput,
  Meeting,
  MeetingDTO,
  Participant,
  ParticipationStatus,
  UpdateMeetingInput,
} from "../types";

export const createMeeting = async (
  meetingData: MeetingDTO,
  userId: string,
) => {
  const dalInput: CreateMeetingInput = {
    ...meetingData,
    startTime: new Date(meetingData.startTime),
    endTime: new Date(meetingData.endTime),
    organizerId: userId,
  };

  const client = await getClient();
  try {
    await client.query("BEGIN");

    const newMeeting = await MeetingModel.createMeeting(dalInput, client);

    if (meetingData.participants && meetingData.participants.length > 0) {
      for (const participantId of meetingData.participants) {
        await ParticipantModel.addParticipant(
          newMeeting.id!,
          participantId,
          client,
        );
      }
    }

    await client.query("COMMIT");
    return newMeeting;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getMyMeetings = async (userId: string, filters: any = {}) => {
  return await MeetingModel.getMeetingsByUserId(userId, filters);
};

export const getMeetingsByCalendar = async (userId: string, month: string) => {
  return await MeetingModel.getMeetingsByCalendar(userId, month);
};

export const respondToInvitation = async (
  meetingId: string,
  userId: string,
  status: ParticipationStatus,
) => {
  return await ParticipantModel.updateParticipantStatus(
    meetingId,
    userId,
    status,
  );
};

export const getUserInvitations = async (userId: string) => {
  return await ParticipantModel.getUserInvitations(userId);
};

export const updateMeeting = async (
  id: string,
  meetingData: Partial<MeetingDTO>,
  userId: string,
) => {
  const existing = await MeetingModel.getMeetingById(id);
  if (!existing) {
    throw { status: 404, message: "Meeting not found" };
  }

  if (existing.organizerId !== userId) {
    throw { status: 403, message: "Not authorized to update this meeting" };
  }
  
  const { participants, ...updateData } = meetingData as any;
  if (updateData.startTime) {
    updateData.startTime = new Date(updateData.startTime);
  }
  if (updateData.endTime) {
    updateData.endTime = new Date(updateData.endTime);
  }
  
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const updatedMeeting = await MeetingModel.updateMeeting(id, updateData, client);

    if (participants !== undefined) {
      const currentParticipants = await ParticipantModel.getMeetingParticipants(id, client);
      const currentParticipantIds = currentParticipants.map(p => p.userId);
      const newParticipantIds = participants as string[];
      
      const toRemove = currentParticipantIds.filter(pid => !newParticipantIds.includes(pid));
      const toAdd = newParticipantIds.filter(pid => !currentParticipantIds.includes(pid));

      for (const pid of toAdd) {
        await ParticipantModel.addParticipant(id, pid, client);
      }
      for (const pid of toRemove) {
        await ParticipantModel.removeParticipant(id, pid, client);
      }
    }
    await client.query("COMMIT");
    return updatedMeeting;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteMeeting = async (id: string, userId: string) => {
  const existing = await MeetingModel.getMeetingById(id);
  if (!existing) {
    throw { status: 404, message: "Meeting not found" };
  }

  if (existing.organizerId !== userId) {
    throw { status: 403, message: "Not authorized to delete this meeting" };
  }

  await MeetingModel.deleteMeeting(id);
};

export const isDoubleBooked = async (
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeMeetingId?: string,
) => {
  return await MeetingModel.isDoubleBooked(
    userId,
    startTime,
    endTime,
    excludeMeetingId,
  );
};
