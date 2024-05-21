import * as mongoose from "mongoose";
import { LikeDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type LikeDocType = LikeDetailsType & Document;
export interface ILike extends LikeDocType {}

const Schema = mongoose.Schema;

const Like = new Schema<ILike>({
  post_id: { required: true, type: "ObjectId" },
  created_at: { type: Date, default: new Date() },
  created_by: { required: true, type: "ObjectId" }
});

const LikeSchema = mongoose.model<ILike>(dbCollectionNames.like, Like);

export default LikeSchema;
