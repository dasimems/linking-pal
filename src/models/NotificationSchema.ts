import * as mongoose from "mongoose";
import { NotificationDetailsType } from "../utils/types";

type NotificationDocType = NotificationDetailsType & Document;
export interface INotification extends NotificationDocType {}

const Schema = mongoose.Schema;

const Notification = new Schema<INotification>({});

const NotificationSchema = mongoose.model<INotification>(
  "notification",
  Notification
);

export default NotificationSchema;
