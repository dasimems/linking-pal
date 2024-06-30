import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { reverseToken } from "../utils/functions";
import { OTPTokenType, TokenType } from "../utils/types";
import UserSchema from "../models/UserSchema";

export const validateSocketUser = async (
  socket: Socket & { user?: any },
  next: (err?: ExtendedError) => void
) => {
  try {
    const sentToken = socket.handshake.headers["authorization"]?.split(" ")[1];

    if (!sentToken) {
      return next(new Error("Authentication error"));
    }
    const decodedToken = (await reverseToken(
      sentToken as string
    )) as TokenType & OTPTokenType;
    const userId = decodedToken?.userId || "";

    if (!userId) {
      return next(new Error("Authentication error"));
    }
    const user = await UserSchema.findById(userId);

    if (!user) {
      return next(new Error("Authentication error"));
    }
    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};
