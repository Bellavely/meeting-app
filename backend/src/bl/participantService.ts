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

export const syncParticipants = async (
  meetingId: string,
  emails: string[],
  organizerId: string,
) => {
  const meeting = await MeetingModel.getMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.organizerId !== organizerId)
    throw new Error("Only organizer can sync participants");

  const currentParticipants =
    await ParticipantModel.getMeetingParticipants(meetingId);
  const currentEmails = currentParticipants
    .filter((p) => p.user)
    .map((p) => p.user!.email.toLowerCase());

  const lowerCaseEmails = emails.map((e) => e.toLowerCase());

  const toAdd = emails.filter(
    (email) => !currentEmails.includes(email.toLowerCase()),
  );

  const toRemove = currentParticipants.filter(
    (p) => p.user && !lowerCaseEmails.includes(p.user.email.toLowerCase()),
  );

  const addedUserIds: string[] = [];
  const removedUsers: string[] = [];
  for (const email of toAdd) {
    try {
      const participant = await inviteParticipant(
        meetingId,
        email,
        organizerId,
      );
      addedUserIds.push(participant.userId);
    } catch (e) {
      console.error(`Sync: Failed to invite ${email}`, e);
    }
  }

  for (const p of toRemove) {
    await ParticipantModel.removeParticipant(meetingId, p.userId);
    removedUsers.push(p.userId)
  }

  return { addedUserIds , removedUsers };
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
