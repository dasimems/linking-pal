import express from "express";
import {
  deleteUserDetailsController,
  getUserDetailsController,
  updateUserDetailsController
} from "../../controllers/user";
const userRoute = express.Router();

userRoute
  .route("/")
  .get(getUserDetailsController)
  .patch(updateUserDetailsController)
  .delete(deleteUserDetailsController);

export default userRoute;
