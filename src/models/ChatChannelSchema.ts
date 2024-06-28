import * as mongoose from "mongoose";
import { ChatChannelDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type ChannelDocType = ChatChannelDetailsType & Document;
export interface IChannel extends ChannelDocType {}

const Schema = mongoose.Schema;

const ChannelUsersSchema = new Schema({
  user_id: { type: mongoose.Types.ObjectId, required: true },
  joined_at: { type: Date, required: true }
});

const ChatChannel = new Schema<IChannel>({
  channel: {
    required: true,
    type: String
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  users: {
    required: true,
    type: [ChannelUsersSchema]
  }
});

const ChatChannelSchema = mongoose.model<IChannel>(
  dbCollectionNames.like,
  ChatChannel
);

export default ChatChannelSchema;
