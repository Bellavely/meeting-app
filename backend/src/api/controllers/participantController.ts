import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as paricipantsService from "../../bl";
import * as UserModel from "../../dal/models/User";
import { participantEmailSchema } from "../../validators";

export const inviteParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meetingId = req.params.id as string;
    const { email } = req.body;
    const organizerId = (req as any).user.id;
    const participant = await paricipantsService.inviteParticipant(
      meetingId,
      email,
      organizerId,
    );

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

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Search query is required" });
    }

    const users = await UserModel.searchUsers(q);

    res.status(StatusCodes.OK).json(users);
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

export const syncMeetingParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meetingId = req.params.id as string;
    const { data, error, success } = participantEmailSchema.safeParse(req.body);
    const organizerId = (req as any).user.id;

    if (!success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.flatten().fieldErrors });
    }

    await paricipantsService.syncParticipants(
      meetingId,
      data.emails,
      organizerId,
    );
    res
      .status(StatusCodes.OK)
      .json({ message: "Participants synced successfully" });
  } catch (error: any) {
    next(error);
  }
};
