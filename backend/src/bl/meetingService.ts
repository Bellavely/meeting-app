import * as MeetingModel from "../dal/models/Meeting";
import * as ParticipantModel from "../dal/models/Participant";

import {
  CreateMeetingInput,
  MeetingDTO,
  ParticipationStatus,
} from "../types/meeting";

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
  return await MeetingModel.createMeeting(dalInput);
};

export const getMyMeetings = async (userId: string, filters: any = {}) => {
  return await MeetingModel.getMeetingsByUserId(userId, filters);
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
  meetingData: any,
  userId: string,
) => {
  const existing = await MeetingModel.getMeetingById(id);
  if (!existing) {
    throw { status: 404, message: "Meeting not found" };
  }

  if (existing.organizerId !== userId) {
    throw { status: 403, message: "Not authorized to update this meeting" };
  }

  const updateData = { ...meetingData };
  if (updateData.startTime)
    updateData.startTime = new Date(updateData.startTime);
  if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

  return await MeetingModel.updateMeeting(id, updateData);
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
