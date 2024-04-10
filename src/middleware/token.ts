import { verificationTypes } from "../utils/_variables";
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
      const decodedToken = (await reverseToken(sentToken)) as TokenType &
        OTPTokenType;
      const userId = decodedToken?.userId || "";
      const verificationType = decodedToken?.verificationType || "";
      if (verificationType === verificationTypes.phone) {
        return res
          .status(tokenError.status)
          .json({
            ...tokenError,
            message: "Please verify your mobile number to continue"
          });
      }
      if (userId) {
        req.body.userId = userId;
        next();
      } else {
        return res.status(tokenError.status).json(tokenError);
      }
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
