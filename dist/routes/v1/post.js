"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = require("../../controllers/post");
const postRoute = express_1.default.Router();
postRoute.route("/").get(post_1.getPostController).post(post_1.createPostController);
postRoute
    .route("/:id")
    .get(post_1.getSinglePostController)
    .patch(post_1.editSinglePostController)
    .delete(post_1.deleteSinglePostController);
exports.default = postRoute;
