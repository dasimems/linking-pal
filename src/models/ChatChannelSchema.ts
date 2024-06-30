import * as mongoose from "mongoose";
import { ChatChannelDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type ChannelDocType = ChatChannelDetailsType & Document;
export interface IChannel extends ChannelDocType {}

const Schema = mongoose.Schema;

const ChannelUsersSchema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, required: true },
  joined_at: { type: Date, default: new Date() },
  left_at: { type: Date, default: null }
});

ChannelUsersSchema.index({ user_id: 1, joined_at: 1, left_at: 1 });

const ChatChannel = new Schema<IChannel>({
  created_at: {
    type: Date,
    default: new Date()
  },
  users: {
    required: true,
    type: [ChannelUsersSchema]
  },
  is_grouped: {
    type: Boolean,
    default: false
  },
  group_name: {
    type: String,
    default: null
  }
});

const ChatChannelSchema = mongoose.model<IChannel>(
  dbCollectionNames.chatChannel,
  ChatChannel
);

export default ChatChannelSchema;
