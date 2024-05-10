import { UserDetailsType } from "../utils/types";

export interface LoginBody {
  email: string;
  password: string;
}
export interface ForgotPasswordBody {
  email: string;
  password: string;
}
export interface SendOTPBody {
  email?: string;
  mobile_number?: string;
}
export interface UpdateMoodBody {
  mood: string[];
}
export interface UpdateLocationBody {
  latitude: number;
  longitude: number;
}
export interface VerifyOTPBody {
  otp: string;
  userId: string;
  verificationType: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  mobile_number: string;
  dob: Date;
  bio: string;
  password: string;
}
export interface UpdateProfileBody extends AUthorizedBody {
  name?: string;
  dob?: Date;
  bio?: string;
}

export interface AUthorizedBody {
  userId: string;
}

export interface UserDetailsResponseType extends UserDetailsType {
  id: string;
}

export interface PostBodyType {
  text: string;
  tags: string[];
}
