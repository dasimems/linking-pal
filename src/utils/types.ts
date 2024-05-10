import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export type ControllerType = (req: Request, res: Response) => void;
export type MiddleWareType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export interface ResponseType {
  status: number;
  message: string;
  data?: any;
  error?: any;
  token?: string;
  total?: number;
}

export interface UserDetailsType {
  email: string;
  mood: string[];
  name: string;
  bio: string;
  dob: Date;
  mobile_number: number;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  video: string;
  created_at: Date;
  updated_at: Date;
  is_verified: boolean;
  has_subscribed: boolean;
  avatar: string;
}

export interface NotificationDetailsType {
  message: string;
  image: string;
  created_at: Date;
  initiator_id: string;
  action_performed: "rejected" | "accepted";
  receiver_id: string;
  accept_url: string | null;
  reject_url: string | null;
  status: "read" | "unread";
}
export interface PostDetailsType {
  text: string;
  files: string[];
  created_at: Date;
  created_by: Types.ObjectId;
  tags: string[];
}
export interface CommentDetailsType {
  comment: string;
  created_at: Date;
  created_by: string;
  post_id: string;
}
export interface LikeDetailsType {
  post_id: string;
  created_at: string;
  created_by: string;
}

export interface TokenType {
  userId?: string;
  userType?: string;
  userAgent?: string;
}

export interface CachedOTPType {
  otp: string;
}

export interface OTPTokenType extends TokenType {
  verificationType?: string;
}
