import express from "express";
import {
  createPostController,
  deleteSinglePostController,
  editSinglePostController,
  getNearbyPostController,
  getPostController,
  getSinglePostController
} from "../../controllers/post";
import { subRoutes } from "../../utils/_variables";
const postRoute = express.Router();

postRoute.route("/").get(getPostController).post(createPostController);
postRoute.route(subRoutes.all).get(getNearbyPostController);
postRoute
  .route("/:id")
  .get(getSinglePostController)
  .patch(editSinglePostController)
  .delete(deleteSinglePostController);

export default postRoute;
