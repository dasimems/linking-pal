import NodeCache from "node-cache";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
// import { jwtAlgo } from "./variable";
import {
  NotificationDetailsType,
  OTPTokenType,
  PostDetailsType,
  TokenType
} from "./types";
import { Document, Types } from "mongoose";
import UserSchema, { IUser } from "../models/UserSchema";
import { AUthorizedBody, UserDetailsResponseType } from "../controllers";
import { Request, Response } from "express";
import {
  badRequestResponse,
  forbiddenResponse,
  internalServerResponse,
  notFoundResponse,
  unauthorizedResponse
} from "./responses";
import { cloudinaryFolderName, expiringTimes, otpKeys } from "./_variables";
import PostSchema, { IPost } from "../models/PostSchema";
import NotificationSchema, {
  INotification
} from "../models/NotificationSchema";

dotenv.config();
const env = process.env;

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const nonExpiringCache = new NodeCache({ stdTTL: 0 });
export const doRequestBodyHaveError = (
  data: { [name: string]: any },
  keys: string[]
): boolean | { [name: string]: string } => {
  const dataKeys = Object.keys(data);
  let error: { [name: string]: string } | null = null;

  keys.forEach((key) => {
    if (key && key.length > 0) {
      if (!dataKeys.includes(key)) {
        error = {
          ...error,
          [key]: `Please provide ${key}`
        };
      }
    }
  });

  if (error) {
    return error;
  } else {
    return false;
  }
};

export const validateValues: <T>(
  data: T | any,
  validation?: {
    [name: string]:
      | {
          required?: boolean & {
            value: boolean;
            message: string;
          } & any;
          regex?: RegExp & {
            value: RegExp;
            message: string;
          } & any;
          minLength?: number & {
            value: number;
            message: string;
          } & any;
          maxLength?: number & {
            value: number;
            message: string;
          } & any;
          min?: number & {
            value: number;
            message: string;
          } & any;
          max?: number & {
            value: number;
            message: string;
          } & any;
        } & boolean &
          any;
  }
) => {
  [name: string]: string;
} | null = (data, validation) => {
  let error: { [name: string]: string } | null = null;

  if (!data || typeof data !== "object") {
    data = {};
  }

  if (
    data &&
    typeof data === "object" &&
    validation &&
    typeof validation === "object"
  ) {
    const validationKeys = Object.keys(validation);

    validationKeys.forEach((key: string) => {
      const value = data[key];
      const validationValue = validation[key];

      if (validationValue) {
        console.log(
          validationValue.maxLength &&
            !isNaN(Number(validationValue.maxLength)) &&
            value.toString().length < validationValue.maxLength
        );
        console.log(
          validationValue?.maxLength?.value &&
            !isNaN(Number(validationValue?.maxLength?.value)) &&
            value.toString().length < validationValue?.maxLength?.value
        );
        if (
          typeof validationValue !== "object" &&
          (!value || value.length < 1)
        ) {
          error = {
            ...error,
            [key]: `Please provide your ${key}`
          };
        } else {
          if (
            (validationValue.required || validationValue?.required?.value) &&
            (!value || value.length < 1)
          ) {
            error = {
              ...error,
              [key]:
                validationValue.required.message || `Please provide your ${key}`
            };
          } else if (
            !isNaN(Number(value)) &&
            ((validationValue.min &&
              !isNaN(Number(validationValue.min)) &&
              Number(value) < validationValue.min) ||
              (validationValue?.min?.value &&
                !isNaN(Number(validationValue?.min?.value)) &&
                Number(value) < validationValue.min.value))
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.min?.message ||
                `Your ${key} must not be less than ${validation.min}`
            };
          } else if (
            !isNaN(Number(value)) &&
            ((validationValue.max &&
              !isNaN(Number(validationValue.max)) &&
              Number(value) > validationValue.max) ||
              (validationValue?.max?.value &&
                !isNaN(Number(validationValue?.max?.value)) &&
                Number(value) > validationValue?.max?.value))
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.max?.message ||
                `Your ${key} must not be greater than ${validation.max}`
            };
          } else if (
            (validationValue.minLength &&
              !isNaN(Number(validationValue.minLength)) &&
              value.toString().length < validationValue.minLength) ||
            (validationValue?.minLength?.value &&
              !isNaN(Number(validationValue?.minLength?.value)) &&
              value.toString().length < validationValue?.minLength?.value)
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.minLength?.message ||
                `Your ${key} must not be less than ${validation.minLength} characters`
            };
          } else if (
            (validationValue.maxLength &&
              !isNaN(Number(validationValue.maxLength)) &&
              value.toString().length > validationValue.maxLength) ||
            (validationValue?.maxLength?.value &&
              !isNaN(Number(validationValue?.maxLength?.value)) &&
              value.toString().length > validationValue?.maxLength?.value)
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.maxLength?.message ||
                `Your ${key} must not be greater than ${validation.maxLength} characters`
            };
          } else if (
            (validationValue.regex &&
              !validationValue?.regex?.value &&
              !validationValue.regex.test(value)) ||
            (validationValue?.regex?.value &&
              !validationValue?.regex?.value.test(value))
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.regex?.message || `Please input a valid ${key}`
            };
          }
        }
      }
    });
  }

  return error;
};

export const validateUser = async (
  req: Request,
  res: Response,
  omitVerification?: boolean
) => {
  let response = {
    ...unauthorizedResponse
  };
  const { userId } = req.body as AUthorizedBody;

  if (!userId) {
    res.status(response.status).json(response);
    return;
  }
  try {
    const user = await UserSchema.findById(userId);

    if (user) {
      if (!user.is_phone_verified || !user.is_email_verified) {
        response = {
          ...forbiddenResponse,
          message: `Please verify your ${
            !user.is_phone_verified && !user.is_email_verified
              ? "email address and mobile number"
              : !user.is_email_verified
              ? "email address"
              : "mobile number"
          }`
        };
        if (omitVerification) {
          return user;
        } else {
          res.status(response.status).json(response);
          return;
        }
      } else {
        return user;
      }
    } else {
      res.status(response.status).json(response);
      return;
    }
  } catch (error) {
    response = {
      ...internalServerResponse
    };
    res.status(response.status).json(response);
    return;
    // create error log
  }
};

export const validatePost = async (req: Request, res: Response) => {
  const { id } = req.params;

  let response = {
    ...internalServerResponse,
    message: "Something went wrong!"
  };

  if (id) {
    try {
      const postDetails = await PostSchema.findById(id);
      if (postDetails) {
        return postDetails;
      } else {
        response = {
          ...notFoundResponse,
          message: "Post doesn't exist or is deleted"
        };
        res.status(response.status).json(response);
        return;
      }
    } catch (error: any) {
      res.status(response.status).json(response);
      return;
    }
  } else {
    response = {
      ...badRequestResponse,
      message: "Post id not found"
    };
    res.status(response.status).json(response);
    return;
  }
};
export const validateNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  let response = {
    ...internalServerResponse,
    message: "Something went wrong!"
  };

  if (id) {
    try {
      const notificationDetails = await NotificationSchema.findById(id);
      if (notificationDetails) {
        return notificationDetails;
      } else {
        response = {
          ...notFoundResponse,
          message: "Notification doesn't exist or is deleted"
        };
        res.status(response.status).json(response);
        return;
      }
    } catch (error: any) {
      res.status(response.status).json(response);
      return;
    }
  } else {
    response = {
      ...badRequestResponse,
      message: "Notification id not found"
    };
    res.status(response.status).json(response);
    return;
  }
};

export const generateCacheKey = (extension: string, id: string) => {
  return `${extension}-${id}`;
};

export const createUserDetails = (
  user:
    | (IUser & {
        _id: Types.ObjectId;
      })
    | null
): UserDetailsResponseType | undefined => {
  if (user) {
    return {
      avatar: user.avatar,
      email: user.email as string,
      id: user._id as unknown as string,
      is_phone_verified: user.is_phone_verified,
      is_email_verified: user.is_email_verified,
      is_verified: user.is_verified,
      has_subscribed: user.has_subscribed,
      created_at: user.created_at,
      updated_at: user.updated_at,
      video: user.video,
      name: user.name,
      bio: user.bio,
      dob: user.dob,
      mood: user.mood,
      mobile_number: user.mobile_number
    };
  }
};
export const createPostDetails = (
  post:
    | (IPost & {
        _id: Types.ObjectId;
      })
    | null
): PostDetailsType | undefined => {
  if (post) {
    return {
      text: post.text,
      tags: post.tags,
      files: post.files,
      created_at: post.created_at,
      created_by: post.created_by
    };
  }
};
export const createNotificationDetails = (
  notification:
    | (INotification & {
        _id: Types.ObjectId;
      })
    | null
): NotificationDetailsType | undefined => {
  if (notification) {
    return {
      message: notification.message,
      accept_url: notification.accept_url,
      reject_url: notification.reject_url,
      action_performed: notification.action_performed,
      created_at: notification.created_at,
      image: notification.image,
      status: notification.status
    };
  }
};

export const getCloudinaryPublicId = (
  fileName: string,
  type: "video" | "image" | "post"
) => {
  let folderName = "";

  switch (type) {
    case "image":
      folderName = cloudinaryFolderName.image;
      break;
    case "video":
      folderName = cloudinaryFolderName.video;
      break;
    case "post":
      folderName = cloudinaryFolderName.post;
      break;

    default:
      break;
  }

  return type ? `${folderName}/${fileName}` : "";
};

export const getFileRoute = (userId: string, fileName: string) => {
  if (userId && fileName) {
    return `${userId}/${fileName}`;
  } else {
    return fileName || "";
  }
};

export const cacheEmailOTP = (otp: string, id: string) => {
  return cache.set(
    generateCacheKey(otpKeys.email, id),
    { otp },
    expiringTimes.otp
  );
};
export const fetchCachedEmailOTP = (id: string) => {
  return cache.get(generateCacheKey(otpKeys.email, id));
};
export const cacheMobileNumberOTP = (otp: string, id: string) => {
  return cache.set(
    generateCacheKey(otpKeys.mobileNumber, id),
    { otp },
    expiringTimes.otp
  );
};
export const fetchCachedMobileNumberOTP = (id: string) => {
  return cache.get(generateCacheKey(otpKeys.mobileNumber, id));
};
export const cacheForgotPasswordOTP = (otp: string, id: string) => {
  return cache.set(
    generateCacheKey(otpKeys.forgotPassword, id),
    { otp },
    expiringTimes.otp
  );
};
export const fetchCachedForgotPasswordOTP = (id: string) => {
  return cache.get(generateCacheKey(otpKeys.forgotPassword, id));
};
export const cacheForgotPasswordToken = (token: string, id: string) => {
  return cache.set(
    generateCacheKey(otpKeys.forgotPasswordToken, id),
    { token },
    expiringTimes.otp * 2
  );
};
export const fetchCachedForgotPasswordToken = (id: string) => {
  return cache.get(generateCacheKey(otpKeys.forgotPasswordToken, id));
};
export const cacheEmail = (email: string, username: string) => {
  return nonExpiringCache.set(username, { email });
};
export const fetchCacheEmail = (username: string) => {
  return nonExpiringCache.get(username);
};

export const createPassword = (password: string) => {
  if (password) {
    return `${password}-${env.PASSWORD_KEY}`;
  } else {
    console.error("Expected the password as a parameter");
    return "";
  }
};

export const generateToken = async (data: TokenType | OTPTokenType) => {
  if (data) {
    return jwt.sign(data, env.SECRET_KEY as string);
  } else {
    console.error("Please pass in the data to be encrypted");
    return "";
  }
};

export const reverseToken = async (token: string) => {
  if (token) {
    return jwt.verify(token, env.SECRET_KEY as string);
  } else {
    console.error("Expected your token as parameter");
  }
};

export const generateOTP = (length: number = 4): string => {
  let otp = "";

  for (var i = 0; i < length; i++) {
    const randomNumber = Math.random() * 9;
    otp = otp + Math.floor(randomNumber);
  }

  console.log(parseInt("0124", 10));

  return otp;
};

export const sendMail = ({
  sender,
  receiver,
  subject,
  message
}: {
  sender: string;
  password: string;
  receiver: string;
  subject: string;
  message: string;
}) => {
  return new Promise<nodemailer.SentMessageInfo>((res, rej) => {
    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "e75ba9eff40919",
        pass: "2eec2377be0b35"
      }
    });

    var mailOptions = {
      from: sender,
      to: receiver,
      subject: subject,
      text: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        rej(error);
      } else {
        res(info);
      }
    });
  });
};

export const convertMinToSecs = (min: number = 1) => {
  return min * 60;
};
