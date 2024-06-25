import * as mongoose from "mongoose";
import { LikeDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type LikeDocType = LikeDetailsType & Document;
export interface ILike extends LikeDocType {}

const Schema = mongoose.Schema;

const Like = new Schema<ILike>({
  post_id: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.post
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  created_by: {
    required: true,
    type: "ObjectId",
    ref: dbCollectionNames.user
  }
});

const LikeSchema = mongoose.model<ILike>(dbCollectionNames.like, Like);

export default LikeSchema;
