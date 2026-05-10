import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as meetingService from '../../bl/meetingService';
import { createMeetingSchema, updateMeetingSchema } from '../../validators/meetingValidators';

export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = createMeetingSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const userId = (req as any).user.id;
        const meeting = await meetingService.createMeeting(parsed.data, userId);
        res.status(StatusCodes.CREATED).json(meeting);
    } catch (error) {
        next(error);
    }
};

export const getMyMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const meetings = await meetingService.getMyMeetings(userId);
        res.status(StatusCodes.OK).json(meetings);
    } catch (error) {
        next(error);
    }
};

export const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const parsed = updateMeetingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors
            });
        }

        const userId = (req as any).user.id;
        const updated = await meetingService.updateMeeting(id, parsed.data, userId);
        res.status(StatusCodes.OK).json(updated);
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        next(error);
    }
};

export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const userId = (req as any).user.id;

        await meetingService.deleteMeeting(id, userId);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        next(error);
    }
};
