import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as meetingService from "../../bl/meetingService";
import {
  createMeetingSchema,
  deleteMeetingSchema,
  updateMeetingSchema,
} from "../../validators";

export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { success, data, error } = createMeetingSchema.safeParse(req.body);

    if (!success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    const userId = (req as any).user.id;
    const meeting = await meetingService.createMeeting(data, userId);
    res.status(StatusCodes.CREATED).json(meeting);
  } catch (error) {
    next(error);
  }
};

export const getMyMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const meetings = await meetingService.getMyMeetings(userId);
    res.status(StatusCodes.OK).json(meetings);
  } catch (error) {
    next(error);
  }
};

export const updateMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

    const { success, error, data } = updateMeetingSchema.safeParse(req.body);
    if (!success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    const userId = (req as any).user.id;
    const updated = await meetingService.updateMeeting(id, data, userId);
    res.status(StatusCodes.OK).json(updated);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      data,
      error,
      success,
    } = deleteMeetingSchema.safeParse(req.params);
    if (!success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }
    const userId = (req as any).user.id;

    await meetingService.deleteMeeting(data.id, userId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};
