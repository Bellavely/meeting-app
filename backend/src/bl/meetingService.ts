import * as MeetingModel from "../dal/models/Meeting";

export const createMeeting = async (meetingData: any, userId: string) => {
    return await MeetingModel.createMeeting({
        ...meetingData,
        startTime: new Date(meetingData.startTime),
        endTime: new Date(meetingData.endTime),
        organizerId: userId
    });
};

export const getMyMeetings = async (userId: string, filters: any = {}) => {
  return await MeetingModel.getMeetingsByUserId(userId, filters);
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
