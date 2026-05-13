import * as models from "../dal/models";
import {
  generateAccessToken,
  generateRefreshToken,
  JWT_SECRET,
} from "../utils";
import jwt from "jsonwebtoken";
import { User } from "../types";
import bcrypt from "bcryptjs";

export const registerUser = async (userData: User) => {
  const existingUser = await models.findUserByEmail(userData.email);
  if (existingUser) {
    throw { status: 409, message: "User already exists" };
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await models.createUser({ ...userData, password: hashedPassword });
};

export const loginUser = async (email: string, password: string) => {
  const user = await models.findUserByEmail(email);
  if (!user || !user.password) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const accessToken = generateAccessToken(user.id!, user.email);
  const refreshToken = await models.createRefreshToken(user.id!);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  const storedToken = await models.findRefreshToken(refreshToken);
  if (!storedToken) {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  try {
    jwt.verify(refreshToken, JWT_SECRET);
  } catch (error) {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  const tokenUser = await models.findUserById(storedToken.userId);
  if (!tokenUser) {
    throw { status: 401, message: "User not found" };
  }

  const newRefreshToken = generateRefreshToken(tokenUser.id!);
  const accessToken = generateAccessToken(tokenUser.id!, tokenUser.email);
  await models.updateRefreshToken(tokenUser.id!, refreshToken, newRefreshToken);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: tokenUser.id,
      firstName: tokenUser.firstName,
      lastName: tokenUser.lastName,
      email: tokenUser.email,
    },
  };
};

export const logout = async (refreshToken: string) => {
  await models.deleteRefreshToken(refreshToken);
};

export const updateUserInfo = async ({
  id,
  lastName,
  firstName,
  email,
}: Omit<User, "password">) => {
  const existingUser = await models.findUserById(id!);
  if (!existingUser) {
    throw { status: 404, message: "User not found" };
  }

  return await models.updateUser(id!, firstName, lastName, email);
};
