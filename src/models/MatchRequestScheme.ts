import * as mongoose from "mongoose";
import { MatchRequestDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type MatchRequestDocType = MatchRequestDetailsType & Document;
export interface IMatchRequest extends MatchRequestDocType {}

const Schema = mongoose.Schema;

const Like = new Schema<IMatchRequest>({
  sender_id: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.user
  },
  receiver_id: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.user
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  is_accepted: {
    type: Boolean,
    default: false
  },
  accepted_at: {
    type: Date,
    default: null
  }
});

const MatchRequestSchema = mongoose.model<IMatchRequest>(
  dbCollectionNames.match,
  Like
);

export default MatchRequestSchema;
