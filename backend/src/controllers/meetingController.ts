import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as MeetingModel from '../models/Meeting';

export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const meeting = await MeetingModel.createMeeting({
            ...req.body,
            organizerId: userId
        });
        res.status(StatusCodes.CREATED).json(meeting);
    } catch (error) {
        next(error);
    }
};

export const getMyMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const meetings = await MeetingModel.getMeetingsByUserId(userId);
        res.status(StatusCodes.OK).json(meetings);
    } catch (error) {
        next(error);
    }
};

export const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).user.id;
        
        const existing = await MeetingModel.getMeetingById(id);
        if (!existing) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Meeting not found' });
        }
        
        if (existing.organizerId !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized to update this meeting' });
        }

        const updated = await MeetingModel.updateMeeting(id, req.body);
        res.status(StatusCodes.OK).json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).user.id;

        const existing = await MeetingModel.getMeetingById(id);
        if (!existing) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Meeting not found' });
        }

        if (existing.organizerId !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized to delete this meeting' });
        }

        await MeetingModel.deleteMeeting(id);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};
