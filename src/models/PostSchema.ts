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
  updated_at: {
    type: Date,
    default: null
  },
  created_by: {
    type: "ObjectId",
    required: true,
    ref: dbCollectionNames.user
  },
  tags: {
    type: [String],
    default: []
  },
  comments: {
    type: ["ObjectId"],
    default: [],
    ref: dbCollectionNames.comment
  },
  likes: {
    type: ["ObjectId"],
    default: [],
    ref: dbCollectionNames.like
  }
});

const PostSchema = mongoose.model<IPost>(dbCollectionNames.post, Post);

export default PostSchema;
