import NodeCache from "node-cache";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
// import { jwtAlgo } from "./variable";
import { OTPTokenType, TokenType } from "./types";
import { Document, Types } from "mongoose";
import { IUser } from "../models/UserSchema";
import { UserDetailsResponseType } from "../controllers";

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
  errors: {
    [name: string]: string;
  };
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
              Number(validationValue.min) &&
              Number(value) < validationValue.min) ||
              (validationValue?.min?.value &&
                Number(validationValue?.min?.value) &&
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
              Number(validationValue.max) &&
              Number(value) > validationValue.max) ||
              (validationValue?.max?.value &&
                Number(validationValue?.max?.value) &&
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
              Number(validationValue.minLength) &&
              value.length < validationValue.minLength) ||
            (validationValue?.minLength?.value &&
              Number(validationValue?.minLength?.value) &&
              value.length < validationValue?.minLength?.value)
          ) {
            error = {
              ...error,
              [key]:
                validationValue?.minLength?.message ||
                `Your ${key} must not be less than ${validation.minLength} characters`
            };
          } else if (
            (validationValue.maxLength &&
              Number(validationValue.maxLength) &&
              value.length < validationValue.maxLength) ||
            (validationValue?.maxLength?.value &&
              Number(validationValue?.maxLength?.value) &&
              value.length < validationValue?.maxLength?.value)
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

export const createUserDetails = (
  user:
    | (IUser & {
        _id: Types.ObjectId;
      })
    | null
): UserDetailsResponseType | undefined => {
  if (user) {
    return {
      email: user.email as string,
      id: user._id as unknown as string,
      is_phone_verified: user.is_phone_verified,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
      name: user.name,
      bio: user.bio,
      dob: user.dob,
      mood: user.mood,
      mobile_number: user.mobile_number
    };
  }
};

export const cacheOTP = (otp: number, email: string) => {
  return cache.set(email, { otp }, 180000);
};
export const fetchCacheOTP = (email: string) => {
  return cache.get(email);
};
export const cacheToken = (token: string, id: string) => {
  return cache.set(id, { token }, 300000);
};
export const fetchCacheToken = (id: string) => {
  return cache.get(id);
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

export const generateOTP = (length: number = 4) => {
  let otp = "";

  for (var i = 0; i < length; i++) {
    const randomNumber = Math.random() * 9;
    otp = otp + Math.floor(randomNumber);
  }

  return parseInt(otp);
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
