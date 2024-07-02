import express from "express";
import {
  dashboardController,
  fetchPostDetailsController,
  postController,
  userController
} from "../../template/dashboardController";
import { isAuthenticated } from "../../middleware/admin";
import { routes } from "../../utils/_variables";
const dashboardRoute = express.Router();

dashboardRoute.use(isAuthenticated);
dashboardRoute.get("/", dashboardController);
dashboardRoute.get(routes.users, userController);
dashboardRoute.get(routes.post, postController);
dashboardRoute.get(`${routes.post}/:id`, fetchPostDetailsController);

export default dashboardRoute;
