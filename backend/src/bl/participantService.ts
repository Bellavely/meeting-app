import * as UserModel from "../dal/models";
import * as MeetingModel from "../dal/models";
import * as ParticipantModel from "../dal/models";

export const inviteParticipant = async (
  meetingId: string,
  email: string,
  organizerId: string,
) => {
  const meeting = await MeetingModel.getMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.organizerId !== organizerId)
    throw new Error("Only organizer can invite participants");

  const userToInvite = await UserModel.findUserByEmail(email);
  if (!userToInvite)
    throw new Error("User with this email does not exist in our app");
  if (userToInvite.id === organizerId)
    throw new Error("Organizer is already a participant");

  return await ParticipantModel.addParticipant(meetingId, userToInvite.id!);
};

export const uninviteParticipant = async (
  meetingId: string,
  userId: string,
  organizerId: string,
) => {
  const meeting = await MeetingModel.getMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.organizerId !== organizerId)
    throw new Error("Only organizer can uninvite participants");

  return await ParticipantModel.removeParticipant(meetingId, userId);
};

export const getMeetingParticipants = async (meetingId: string) => {
  return await ParticipantModel.getMeetingParticipants(meetingId);
};
