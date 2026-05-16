import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as meetingService from "../../bl/meetingService";
import {
  createMeetingSchema,
  deleteMeetingSchema,
  doubleBookingCheckSchema,
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
    const { month, page = 1, limit = 10 } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { meetings, totalCount } = await meetingService.getMyMeetings(
      userId,
      {
        month,
        limit: parseInt(limit),
        offset,
      },
    );
    res.status(StatusCodes.OK).json({
      meetings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const queryMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const { search, page = 1, limit = 10 } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { meetings, totalCount } = await meetingService.getMyMeetings(
      userId,
      {
        search,
        limit: parseInt(limit),
        offset,
      },
    );
    res.status(StatusCodes.OK).json({
      meetings,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
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
    const userId = (req as any).user.id;

    const { success, error, data } = updateMeetingSchema.safeParse(req.body);
    if (!success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    const updated = await meetingService.updateMeeting(id, data, userId);
    res.status(StatusCodes.OK).json(updated);
  } catch (error: any) {
    next(error);
  }
};

export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { data, error, success } = deleteMeetingSchema.safeParse(req.params);
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
    next(error);
  }
};

export const isDoubleBooked = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const { data, error, success } = doubleBookingCheckSchema.safeParse(
      req.body,
    );
    if (!success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }
    res.status(StatusCodes.OK).json({
      isDoubleBooked: await meetingService.isDoubleBooked(
        userId,
        new Date(data.startTime),
        new Date(data.endTime),
        data.excludeMeetingId ? data.excludeMeetingId : undefined,
      ),
    });
  } catch (error: any) {
    next(error);
  }
};
