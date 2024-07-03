import { Session } from "express-session";
import { MiddleWareType, UserDetailsType } from "../utils/types";
import { routes, subRoutes } from "../utils/_variables";
import * as variables from "../utils/_variables";
import UserSchema from "../models/UserSchema";
import PostSchema from "../models/PostSchema";

export const isAuthenticated: MiddleWareType = (req, res, next) => {
  const session = req.session as Session & {
    user?: UserDetailsType;
  };
  const originalUrl = req.originalUrl;
  const urlWithoutQuery = originalUrl.split("?")[0];

  // Split by '#' to remove the hash fragment
  const urlWithoutHash = urlWithoutQuery.split("#")[0];
  console.log(session.user);
  res.locals.layout = "layouts/loggedin";
  next();
  // if (session.user) {
  //   res.locals.layout = "layouts/loggedin";
  //   return next();
  // }

  // if (!session.user) {
  //   res.redirect(
  //     `${routes.admin}${subRoutes.login}?route=${encodeURIComponent(
  //       urlWithoutHash
  //     )}`
  //   );
  //   // return next();
  // }
};
export const isLoggedIn: MiddleWareType = (req, res, next) => {
  const session = req.session as Session & {
    user?: UserDetailsType;
  };
  if (session.user) {
    res.locals.layout = "layouts/loggedin";
    res.redirect(routes.admin);
  }

  if (!session.user) {
    return next();
  }
};
export const defaultVarsMiddleware: MiddleWareType = async (req, res, next) => {
  // Set default variables

  const originalUrl = req.originalUrl;
  const urlWithoutQuery = originalUrl.split("?")[0];
  console.log(variables.routes.users);
  // Split by '#' to remove the hash fragment
  const urlWithoutHash = urlWithoutQuery.split("#")[0];

  const totalUsersPromise = UserSchema.countDocuments();
  const totalPostsPromise = PostSchema.countDocuments();
  const [totalUsers, totalPosts] = await Promise.all([
    totalUsersPromise,
    totalPostsPromise
  ]);
  res.locals = {
    ...res.locals,
    title: "Linking pal | Admin",
    label: undefined,
    placeholder: undefined,
    inputType: undefined,
    id: undefined,
    className: undefined,
    inputClassName: undefined,
    buttonType: undefined,
    children: undefined,
    text: undefined,
    labelClassName: undefined,
    message: undefined,
    activeUrl: urlWithoutHash,
    name: undefined,
    variables,
    users: undefined,
    totalUsers,
    totalPosts,
    posts: undefined,
    post: undefined,
    user: undefined,
    removeSeeAll: undefined,
    max: undefined,
    author: undefined,
    comments: undefined,
    maxResult: 10
  }; // Default CSS class name

  // Call next() to pass control to the next middleware or route handler
  next();
};
