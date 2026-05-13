import * as MeetingModel from "../dal/models/Meeting";
import * as ParticipantModel from "../dal/models/Participant";
import * as UserModel from "../dal/models/User";
import { CreateMeetingInput, MeetingDTO, ParticipationStatus } from "../types/meeting";

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

export const inviteParticipant = async (meetingId: string, email: string, organizerId: string) => {
    const meeting = await MeetingModel.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.organizerId !== organizerId) throw new Error('Only organizer can invite participants');

    const userToInvite = await UserModel.findUserByEmail(email);
    if (!userToInvite) throw new Error('User with this email does not exist in our app');
    if (userToInvite.id === organizerId) throw new Error('Organizer is already a participant');

    return await ParticipantModel.addParticipant(meetingId, userToInvite.id);
};

export const respondToInvitation = async (meetingId: string, userId: string, status: ParticipationStatus) => {
    return await ParticipantModel.updateParticipantStatus(meetingId, userId, status);
};

export const getMeetingParticipants = async (meetingId: string) => {
    return await ParticipantModel.getMeetingParticipants(meetingId);
};

export const getUserInvitations = async (userId: string) => {
    return await ParticipantModel.getUserInvitations(userId);
};

export const uninviteParticipant = async (meetingId: string, userId: string, organizerId: string) => {
    const meeting = await MeetingModel.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.organizerId !== organizerId) throw new Error('Only organizer can uninvite participants');

    return await ParticipantModel.removeParticipant(meetingId, userId);
};

export const syncParticipants = async (meetingId: string, emails: string[], organizerId: string) => {
    const meeting = await MeetingModel.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.organizerId !== organizerId) throw new Error('Only organizer can sync participants');

    const currentParticipants = await ParticipantModel.getMeetingParticipants(meetingId);
    const currentEmails = currentParticipants
        .filter(p => p.user)
        .map(p => p.user!.email.toLowerCase());

    const lowerCaseEmails = emails.map(e => e.toLowerCase());

    const toAdd = emails.filter(email => !currentEmails.includes(email.toLowerCase()));
    
    const toRemove = currentParticipants.filter(p => 
        p.user && !lowerCaseEmails.includes(p.user.email.toLowerCase())
    );

    for (const email of toAdd) {
        try {
            await inviteParticipant(meetingId, email, organizerId);
        } catch (e) {
            console.error(`Sync: Failed to invite ${email}`, e);
        }
    }

    for (const p of toRemove) {
        await ParticipantModel.removeParticipant(meetingId, p.userId);
    }
};



export const updateMeeting = async (id: string, meetingData: any, userId: string) => {
    const existing = await MeetingModel.getMeetingById(id);
    if (!existing) {
        throw { status: 404, message: "Meeting not found" };
    }

    if (existing.organizerId !== userId) {
        throw { status: 403, message: "Not authorized to update this meeting" };
    }

    const updateData = { ...meetingData };
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
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
