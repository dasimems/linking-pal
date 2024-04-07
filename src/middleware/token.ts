import { reverseToken } from "../utils/functions";
import {
  MiddleWareType,
  OTPTokenType,
  ResponseType,
  TokenType
} from "../utils/types";

export const verifyUserToken: MiddleWareType = async (req, res, next) => {
  let sentToken = req.headers.authorization;
  const tokenError: ResponseType = {
    message: "Unauthorized",
    status: 401
  };

  if (sentToken) {
    sentToken = sentToken.replace("Bearer", "").trim();
    try {
      const decodedToken = (await reverseToken(sentToken)) as TokenType;
      req.body.userId = decodedToken?.userId || "";
      next();
    } catch (error) {
      return res.status(tokenError.status).json(tokenError);
    }
  } else {
    return res.status(tokenError.status).json(tokenError);
  }
};

export const verifyOTPToken: MiddleWareType = async (req, res, next) => {
  let sentToken = req.headers.authorization;
  const tokenError: ResponseType = {
    message: "Unauthorized",
    status: 401
  };

  if (sentToken) {
    sentToken = sentToken.replace("Bearer", "").trim();
    try {
      const decodedToken = (await reverseToken(sentToken)) as OTPTokenType;
      req.body.userId = decodedToken?.userId || "";
      req.body.verificationType = decodedToken?.verificationType || "";
      next();
    } catch (error) {
      return res.status(tokenError.status).json(tokenError);
    }
  } else {
    return res.status(tokenError.status).json(tokenError);
  }
};
