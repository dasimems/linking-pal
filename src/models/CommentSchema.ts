import * as mongoose from "mongoose";
import { CommentDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type CommentDocType = CommentDetailsType & Document;
export interface IComment extends CommentDocType {}

const Schema = mongoose.Schema;

const Comment = new Schema<IComment>({
  post_id: { required: true, type: "ObjectId" },
  created_at: { type: Date, default: new Date() },
  created_by: { required: true, type: "ObjectId" },
  comment: {
    required: true,
    type: String
  },
  likes: {
    default: [],
    type: [String]
  },
  replies: {
    default: [],
    type: [String]
  }
});

const CommentSchema = mongoose.model<IComment>(
  dbCollectionNames.comment,
  Comment
);

export default CommentSchema;
