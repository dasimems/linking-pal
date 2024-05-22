import express from "express";
import {
  createCommentController,
  createPostController,
  deleteSinglePostController,
  dislikeAPostController,
  editSinglePostController,
  getCommentController,
  getNearbyPostController,
  getPostController,
  getSinglePostController,
  likeAPostController
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

postRoute
  .route(`/:id${subRoutes.like}`)
  .patch(likeAPostController)
  .delete(dislikeAPostController);
postRoute
  .route(`/:id${subRoutes.comment}`)
  .get(getCommentController)
  .post(createCommentController);

export default postRoute;
