import express from "express";
import {
  acceptMatchRequestController,
  deleteUserDetailsController,
  getMatchesController,
  getMatchRequestController,
  getNearbyUsersController,
  getParticularUserDetailsController,
  getUserDetailsController,
  sendMatchRequestController,
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

userRoute.route(subRoutes.nearby).get(getNearbyUsersController);

userRoute.route(subRoutes.mood).post(updateUserMoodController);
userRoute.route(subRoutes.location).post(updateUserLocationController);
userRoute.route(subRoutes.video).post(updateUserVideoController);
userRoute.route(subRoutes.image).post(updateUserAvatarController);
userRoute.route(subRoutes.match).get(getMatchesController);
userRoute
  .route(`${subRoutes.match}${subRoutes.request}`)
  .get(getMatchRequestController);
userRoute
  .route(`${subRoutes.match}${subRoutes.request}/:id`)
  .post(sendMatchRequestController)
  .patch(acceptMatchRequestController);
userRoute.route("/:id").get(getParticularUserDetailsController);

export default userRoute;
