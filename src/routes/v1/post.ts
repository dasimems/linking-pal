import express from "express";
import {
  createCommentController,
  createPostController,
  deleteACommentController,
  deleteSinglePostController,
  disLikeACommentController,
  dislikeAPostController,
  editACommentController,
  editSinglePostController,
  getCommentController,
  getNearbyPostController,
  getPostController,
  getSingleCommentController,
  getSinglePostController,
  likeACommentController,
  likeAPostController
} from "../../controllers/post";
import { subRoutes } from "../../utils/_variables";
const postRoute = express.Router();

postRoute.route("/").get(getPostController).post(createPostController);
postRoute.route(subRoutes.all).get(getNearbyPostController);
postRoute
  .route(`${subRoutes.comment}/:id`)
  .get(getSingleCommentController)
  .patch(editACommentController)
  .delete(deleteACommentController);
postRoute
  .route(`${subRoutes.comment}/:id${subRoutes.like}`)
  .patch(likeACommentController)
  .delete(disLikeACommentController);
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
