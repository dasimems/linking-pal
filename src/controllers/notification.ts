import NotificationSchema from "../models/NotificationSchema";
import {
  createNotificationDetails,
  validateNotification,
  validateUser
} from "../utils/functions";
import { getResponse, internalServerResponse } from "../utils/responses";
import { ControllerType } from "../utils/types";

export const getAllNotification: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      try {
        const notifications = await NotificationSchema.find({
          receiver_id: user._id
        });
        const formatedNotifications = notifications.map((notification) =>
          createNotificationDetails(notification)
        );
        response = {
          ...getResponse,
          data: formatedNotifications,
          total: notifications.length
        };
      } catch (error) {}
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getSingleNotification: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const notification = await validateNotification(req, res);

      if (notification) {
        const notificationDetails = createNotificationDetails(notification);
        response = {
          ...getResponse,
          data: notificationDetails
        };
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  markSingleNotificationRead: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const notification = await validateNotification(req, res);

      if (notification) {
        try {
          const updatedNotification =
            await NotificationSchema.findByIdAndUpdate(
              notification._id,
              {
                status: "read"
              },
              {
                new: true
              }
            );

          const notificationDetails =
            createNotificationDetails(updatedNotification);
          response = {
            ...getResponse,
            data: notificationDetails
          };
        } catch (error) {}
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  markNotificationRead: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const notification = await validateNotification(req, res);

      if (notification) {
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  };
