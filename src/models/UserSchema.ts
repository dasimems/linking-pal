import * as mongoose from "mongoose";
import { UserDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type UserDocType = UserDetailsType & Document;
export interface IUser extends UserDocType {
  password: string;
  referred_by: string | null;
  mood_last_updated: Date;
  matches: mongoose.Types.ObjectId[];
  match_request: mongoose.Types.ObjectId[];
  chats: string[];
}

const Schema = mongoose.Schema;

const User = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  mobile_number: {
    type: Number,
    required: true,
    unique: true
  },
  longitude: {
    type: Number,
    default: null
  },
  latitude: {
    type: Number,
    default: null
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
  has_subscribed: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  mood: {
    type: [String],
    default: null
  },
  matches: {
    type: [mongoose.Types.ObjectId],
    default: null
  },
  match_request: {
    type: [mongoose.Types.ObjectId],
    default: null
  },
  chats: {
    type: [String],
    default: null
  },
  gender: {
    type: String,
    default: null
  },
  video: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  mood_last_updated: {
    type: Date,
    default: null
  },
  updated_at: {
    type: Date,
    default: null
  },
  referred_by: {
    type: String,
    default: null
  }
});

const UserSchema = mongoose.model<IUser>(dbCollectionNames.user, User);

export default UserSchema;
