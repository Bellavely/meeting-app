import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "../../bl/authService";
import { registerSchema, loginSchema } from "../../validators/authValidators";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await authService.registerUser(parsed.data);

    res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;
    const result = await authService.loginUser(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error: any) {
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Refresh token is required" });
    }

    const result = await authService.refreshUserToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({ 
        accessToken: result.accessToken,
        user: result.user
    });
  } catch (error: any) {
    if (error.status) {
        return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    res.clearCookie("refreshToken");
    res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
