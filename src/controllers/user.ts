import { ControllerType } from "../utils/types";

export const getUserDetailsController: ControllerType = (req, res) => {
    res.send("this is to get user details");
  },
  updateUserDetailsController: ControllerType = (req, res) => {
    res.send("this is to update user details");
  },
  deleteUserDetailsController: ControllerType = (req, res) => {
    res.send("this is to delete user details");
  },
  updateUserMoodController: ControllerType = (req, res) => {
    res.send("this is to update user mood");
  },
  updateUserLocationController: ControllerType = (req, res) => {
    res.send("this is to update user location");
  },
  updateUserVideoController: ControllerType = (req, res) => {
    res.send("this is to update user video");
  };
