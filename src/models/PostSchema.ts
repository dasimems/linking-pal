import * as mongoose from "mongoose";
import { PostDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type PostDocType = PostDetailsType & Document;
export interface IPost extends PostDocType {}

const Schema = mongoose.Schema;

const Post = new Schema<IPost>({
  text: {
    type: String,
    required: true
  },
  files: {
    type: [String],
    required: true
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  created_by: {
    type: "ObjectId",
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  comments: {
    type: [String],
    default: []
  },
  likes: {
    type: [String],
    default: []
  }
});

const PostSchema = mongoose.model<IPost>(dbCollectionNames.post, Post);

export default PostSchema;
