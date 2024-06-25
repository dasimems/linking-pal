import * as mongoose from "mongoose";
import { CommentDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type CommentDocType = CommentDetailsType & Document;
export interface IComment extends CommentDocType {}

const Schema = mongoose.Schema;

const Comment = new Schema<IComment>({
  post_id: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.post
  },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: null },
  created_by: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.user
  },
  comment: {
    required: true,
    type: String
  },
  likes: {
    default: [],
    type: ["ObjectId"],
    ref: dbCollectionNames.like
  },
  replies: {
    default: [],
    type: ["ObjectId"],
    ref: dbCollectionNames.comment
  }
});

const CommentSchema = mongoose.model<IComment>(
  dbCollectionNames.comment,
  Comment
);

export default CommentSchema;
