import { ControllerType } from "../utils/types";

export const getUserDetailsController: ControllerType = (req, res) => {
  res.send("this is to get user details");
};
export const updateUserDetailsController: ControllerType = (req, res) => {
  res.send("this is to update user details");
};
export const deleteUserDetailsController: ControllerType = (req, res) => {
  res.send("this is to delete user details");
};
