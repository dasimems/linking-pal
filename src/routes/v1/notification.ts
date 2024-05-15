import express from "express";
import {
  getAllNotification,
  getSingleNotification,
  markNotificationRead,
  markSingleNotificationRead
} from "../../controllers/notification";
const notificationRoute = express.Router();

notificationRoute.route("/").get(getAllNotification);
notificationRoute.route("/:id").get(getSingleNotification);
notificationRoute.route("/:id/read").get(markSingleNotificationRead);
notificationRoute.route("read").get(markNotificationRead);
export default notificationRoute;
