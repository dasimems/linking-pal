import * as mongoose from "mongoose";
import { ChatDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type ChatDocType = ChatDetailsType & Document;
export interface IChat extends ChatDocType {}

const Schema = mongoose.Schema;

const ChatUserSchema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, required: true },
  seen_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null }
});

ChatUserSchema.index({ user_id: 1, seen_at: 1 });

const Chat = new Schema<IChat>({
  created_at: {
    type: Date,
    default: new Date()
  },
  updated_at: {
    type: Date,
    default: null
  },
  channel: {
    type: "ObjectID",
    required: true,
    ref: dbCollectionNames.chatChannel
  },
  users: {
    required: true,
    type: [ChatUserSchema]
  },
  message: {
    required: true,
    type: String
  },
  files: {
    type: [String],
    default: null
  },
  sender_id: {
    type: "ObjectID",
    required: true
  }
});

const ChatSchema = mongoose.model<IChat>(dbCollectionNames.chat, Chat);

export default ChatSchema;
