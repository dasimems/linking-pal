import * as mongoose from "mongoose";
import { NotificationDetailsType } from "../utils/types";
import { dbCollectionNames } from "../utils/_variables";

type NotificationDocType = NotificationDetailsType & Document;
export interface INotification extends NotificationDocType {
  initiator_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
}

const Schema = mongoose.Schema;

const Notification = new Schema<INotification>({
  message: {
    required: true,
    type: String
  },
  image: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  initiator_id: {
    type: "ObjectId",
    required: true
  },
  receiver_id: {
    type: "ObjectId",
    required: true
  },
  action_performed: {
    type: String,
    default: null
  },
  accept_url: {
    type: String,
    default: null
  },
  reject_url: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "unread"
  }
});

const NotificationSchema = mongoose.model<INotification>(
  dbCollectionNames.notification,
  Notification
);

export default NotificationSchema;
