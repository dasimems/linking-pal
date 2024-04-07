import { NextFunction, Request, Response } from "express";

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
  id: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: Date;
  referred_by: string | null;
}

export interface TokenType {
  userId?: string;
  userType?: string;
  userAgent?: string;
}

export interface OTPTokenType extends TokenType {
  verificationType?: string;
}
