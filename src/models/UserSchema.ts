import * as mongoose from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: Date;
  referred_by: string | null;
}

const Schema = mongoose.Schema;

const User = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
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
