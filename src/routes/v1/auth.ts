import express from "express";
import { subRoutes } from "../../utils/_variables";
import {
  forgetPasswordController,
  loginController,
  signUpController
} from "../../controllers/auth";
const authRoute = express.Router();

authRoute.post(subRoutes.login, loginController);
authRoute.post(subRoutes.register, signUpController);
authRoute.post(subRoutes.forgotPassword, forgetPasswordController);

export default authRoute;
