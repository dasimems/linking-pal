import express from "express";
import {
  adminLoginController,
  loginController
} from "../../template/loginController";
import { subRoutes } from "../../utils/_variables";
import { isLoggedIn } from "../../middleware/admin";
const loginRoute = express.Router();
loginRoute
  .route(subRoutes.login)
  .get(isLoggedIn, loginController)
  .post(adminLoginController);

export default loginRoute;
