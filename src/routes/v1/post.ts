import express from "express";
import {
  createPostController,
  deleteSinglePostController,
  editSinglePostController,
  getPostController,
  getSinglePostController
} from "../../controllers/post";
const postRoute = express.Router();

postRoute.route("/").get(getPostController).post(createPostController);
postRoute
  .route("/:id")
  .get(getSinglePostController)
  .patch(editSinglePostController)
  .delete(deleteSinglePostController);

export default postRoute;
