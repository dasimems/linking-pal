import PostSchema from "../models/PostSchema";
import UserSchema from "../models/UserSchema";
import { ControllerType } from "../utils/types";

export const dashboardController: ControllerType = async (req, res) => {
  const usersPromise = UserSchema.find().sort({ created_at: -1 }).limit(7);
  const postPromise = PostSchema.find().sort({ created_at: -1 }).limit(7);

  const totalUsersPromise = UserSchema.countDocuments();
  const totalPostsPromise = PostSchema.countDocuments();
  const [users, posts, totalUsers, totalPosts] = await Promise.all([
    usersPromise,
    postPromise,
    totalUsersPromise,
    totalPostsPromise
  ]);
  const postAuthors = await Promise.all(
    posts.map((post) => UserSchema.findById(post.created_by))
  );
  console.log(users.length);
  res.render("index", {
    title: "Admin Dashboard",
    message: "Welcome, admin!",
    users,
    posts: posts.map((post, index) => ({
      post: posts[index],
      author: postAuthors[index]
    })),
    totalUsers,
    totalPosts
  });
};
export const userController: ControllerType = async (req, res) => {
  const query = req.query;
  const { page } = query || {};
  const maxData = res.locals.maxResult || 10;
  res.locals.maxResult = maxData;
  const users = await UserSchema.find()
    .skip(
      parseInt((parseInt((page || "1").toString()) - 1).toString()) * maxData
    )
    .limit(maxData)
    .sort({ created_at: -1 });
  res.render("users", {
    title: "Users",
    message: "Welcome, admin!",
    users
  });
};
export const postController: ControllerType = async (req, res) => {
  const query = req.query;
  const { page } = query || {};
  const maxData = res.locals.maxResult || 10;
  res.locals.maxResult = maxData;
  const posts = await PostSchema.find()
    .skip(
      parseInt((parseInt((page || "1").toString()) - 1).toString()) * maxData
    )
    .limit(maxData)
    .sort({ created_at: -1 });
  const postAuthors = await Promise.all(
    posts.map((post) => UserSchema.findById(post.created_by))
  );
  res.render("posts", {
    title: "User posts",
    message: "Welcome, admin!",
    posts: posts.map((_, index) => ({
      post: posts[index],
      author: postAuthors[index]
    }))
  });
};
export const fetchPostDetailsController: ControllerType = async (req, res) => {
  const { id } = req?.params || {};
  try {
    if (id) {
      const post = await PostSchema.findById(id);
      if (post) {
        const postAuthorPromise = UserSchema.findById(post?.created_by);
        const postCommentPromise = UserSchema.findById(post?.created_by);
        const [postAuthor, postComment] = await Promise.all([
          postAuthorPromise,
          postCommentPromise
        ]);
        res.render("post-details", {
          title: `Post by - ${postAuthor?.name ?? "Deleted Account"}`,
          message: "Welcome, admin!",
          post,
          author: postAuthor,
          comments: postComment
        });
      }
    }
  } catch (error) {}
};
