import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as meetingService from '../../bl/meetingService';
import * as UserModel from '../../dal/models/User';

export const inviteParticipant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meetingId = req.params.id as string;
        const { email } = req.body;
        const organizerId = (req as any).user.id;

        const participant = await meetingService.inviteParticipant(meetingId, email, organizerId);
        res.status(StatusCodes.CREATED).json(participant);
    } catch (error: any) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
};

export const respondToInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meetingId = req.params.id as string;
        const { status } = req.body;
        const userId = (req as any).user.id;

        const updated = await meetingService.respondToInvitation(meetingId, userId, status);
        res.status(StatusCodes.OK).json(updated);
    } catch (error: any) {
        next(error);
    }
};

export const getMeetingParticipants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meetingId = req.params.id as string;
        const participants = await meetingService.getMeetingParticipants(meetingId);
        res.status(StatusCodes.OK).json(participants);
    } catch (error: any) {
        next(error);
    }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Search query is required' });
        }
        const users = await UserModel.searchUsers(q);
        res.status(StatusCodes.OK).json(users);
    } catch (error: any) {
        next(error);
    }
};

export const getMyInvitations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const invitations = await meetingService.getUserInvitations(userId);
        res.status(StatusCodes.OK).json(invitations);
    } catch (error: any) {
        next(error);
    }
};
