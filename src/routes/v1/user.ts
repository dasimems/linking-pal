import express from "express";
import {
  deleteUserDetailsController,
  getUserDetailsController,
  updateUserAvatarController,
  updateUserDetailsController,
  updateUserLocationController,
  updateUserMoodController,
  updateUserVideoController
} from "../../controllers/user";
import { subRoutes } from "../../utils/_variables";
const userRoute = express.Router();

userRoute
  .route("/")
  .get(getUserDetailsController)
  .patch(updateUserDetailsController)
  .delete(deleteUserDetailsController);

userRoute.route(subRoutes.mood).post(updateUserMoodController);
userRoute.route(subRoutes.location).post(updateUserLocationController);
userRoute.route(subRoutes.video).post(updateUserVideoController);
userRoute.route(subRoutes.image).post(updateUserAvatarController);

export default userRoute;
