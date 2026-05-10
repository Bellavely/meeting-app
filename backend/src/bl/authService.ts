import { 
    createUser, 
    findUserByEmail, 
    validatePassword, 
    findUserById 
} from "../dal/models/User";
import { 
    createRefreshToken, 
    deleteRefreshToken, 
    findRefreshToken, 
    updateRefreshToken 
} from "../dal/models/RefreshToken";
import { generateAccessToken, generateRefreshToken, JWT_SECRET } from "../utils";
import jwt from "jsonwebtoken";
import { refresh } from "../api/controllers";

export const registerUser = async (userData: any) => {
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
        throw { status: 409, message: "User already exists" };
    }

    return await createUser(userData);
};

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user || !user.password) {
        throw { status: 401, message: "Invalid credentials" };
    }

    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
        throw { status: 401, message: "Invalid credentials" };
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);

    return {
        accessToken,
        refreshToken,
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
    };
};

export const refreshUserToken = async (refreshToken: string) => {
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken) {
        throw { status: 401, message: "Invalid or expired refresh token" };
    }

    try {
        jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
        throw { status: 401, message: "Invalid or expired refresh token" };
    }

    const tokenUser = await findUserById(storedToken.userId);
    if (!tokenUser) {
        throw { status: 401, message: "User not found" };
    }

    const newRefreshToken = generateRefreshToken(tokenUser.id);
    const accessToken = generateAccessToken(tokenUser.id, tokenUser.email);
    await updateRefreshToken(tokenUser.id, refreshToken, newRefreshToken);

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
            firstName: tokenUser.firstName,
            lastName: tokenUser.lastName,
            email: tokenUser.email,
        }
    };
};

export const logout = async(refreshUserToken:string) =>{
    await deleteRefreshToken(refreshUserToken)
}
