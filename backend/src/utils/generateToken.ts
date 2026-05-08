import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";
export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string, expiresInDays = 30): string => {
  return jwt.sign({ id: userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: `${expiresInDays}d`,
  });
};
