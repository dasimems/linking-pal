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
  count?: number;
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
  longitude: number;
  latitude: number;
  gender: string;
}

export interface NearbyUserType {
  age: string;
  mood: string;
  distance: string;
  interest: string;
}
export interface AuthorDetailsType {
  // email: string;
  mood: string[];
  name: string;
  // bio: string;
  // dob: Date;
  // mobile_number: number;
  // is_phone_verified: boolean;
  // is_email_verified: boolean;
  // video: string;
  // created_at: Date;
  // updated_at: Date;
  // is_verified: boolean;
  // has_subscribed: boolean;
  avatar: string;
}

export interface NotificationDetailsType {
  message: string;
  image: string | null;
  created_at: Date;
  action_performed: "rejected" | "accepted";
  accept_url: string | null;
  reject_url: string | null;
  status: "read" | "unread";
}
export interface PostDetailsType {
  text: string;
  files: string[];
  created_at: Date;
  created_by: Types.ObjectId;
  updated_at: Date;
  tags: string[];
  comments: Types.ObjectId[];
  likes: Types.ObjectId[];
}
export interface CommentDetailsType {
  comment: string;
  created_at: Date;
  updated_at: Date;
  created_by: Types.ObjectId;
  post_id: Types.ObjectId;
  likes: Types.ObjectId[];
  replies: Types.ObjectId[];
}
export interface LikeDetailsType {
  post_id: Types.ObjectId;
  created_at: Date;
  created_by: Types.ObjectId;
}
export interface MatchRequestDetailsType {
  sender_id: Types.ObjectId;
  receiver_id: Types.ObjectId;
  created_at: Date;
  is_accepted: boolean;
  accepted_at: Date;
}

export interface ChatUserType {
  user_id: Types.ObjectId;
}

export interface ChannelUsersType extends ChatUserType {
  joined_at: Date;
  left_at: Date;
}
export interface ChatSeenUsersType extends ChatUserType {
  seen_at: Date;
  deleted_at: Date;
}

export interface ChatChannelDetailsType {
  users: ChannelUsersType[];
  created_at: Date;
  is_grouped: boolean;
  group_name: string;
}

export interface ChatDetailsType {
  channel: Types.ObjectId;
  users: ChatSeenUsersType[];
  created_at: Date;
  updated_at: Date;
  message: string;
  files: string[];
  sender_id: Types.ObjectId;
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
