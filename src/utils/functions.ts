import NodeCache from "node-cache";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
// import { jwtAlgo } from "./variable";
import { OTPTokenType, TokenType } from "./types";

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
  password,
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
