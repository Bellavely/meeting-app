import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as UserModel from "../../dal/models";

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
