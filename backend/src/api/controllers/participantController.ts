import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as paricipantsService from "../../bl";
import * as meetingService from "../../bl/meetingService";
import { Participant } from "../../types";

export const inviteParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meetingId = req.params.id as string;
    const { email } = req.body;
    const organizerId = (req as any).user.id;
    const participant = (await paricipantsService.inviteParticipant(
      meetingId,
      email,
      organizerId,
    )) as Participant;

    const io = req.app.get("io");
    if (io) {
      const meeting = await meetingService.getMeetingById(meetingId);
      if (meeting) {
        io.to(participant.userId).emit("refetch_meetings");
      }
    }

    res.status(StatusCodes.CREATED).json(participant);
  } catch (error: any) {
    next(error);
  }
};

export const respondToInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meetingId = req.params.id as string;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const updated = await paricipantsService.respondToInvitation(
      meetingId,
      userId,
      status,
    );

    res.status(StatusCodes.OK).json(updated);
  } catch (error: any) {
    next(error);
  }
};

export const getMeetingParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meetingId = req.params.id as string;
    const participants =
      await paricipantsService.getMeetingParticipants(meetingId);

    res.status(StatusCodes.OK).json(participants);
  } catch (error: any) {
    next(error);
  }
};

export const getMyInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const invitations = await paricipantsService.getUserInvitations(userId);
    res.status(StatusCodes.OK).json(invitations);
  } catch (error: any) {
    next(error);
  }
};
