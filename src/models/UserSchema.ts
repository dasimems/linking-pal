import * as mongoose from "mongoose";
import { UserDetailsType } from "../utils/types";

type UserDocType = UserDetailsType & Document;
export interface IUser extends UserDocType {
  password: string;
  referred_by: string | null;
}

const Schema = mongoose.Schema;

const User = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  mobile_number: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  is_phone_verified: {
    type: Boolean,
    default: false
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  mood: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  referred_by: {
    type: String,
    default: null
  }
});

const UserSchema = mongoose.model<IUser>("user", User);

export default UserSchema;
