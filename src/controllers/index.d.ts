import { UserDetailsType } from "../utils/types";

export interface LoginBody {
  email: string;
  password: string;
}
export interface ForgotPasswordBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  mobile_number: string;
  dob: Date;
  bio: string;
  password: string;
}

export interface UserDetailsResponseType extends UserDetailsType {
  id: string;
}
