import express from "express";
import { routes } from "../../utils/_variables";
import userRoute from "./user";
import { verifyOTPToken, verifyUserToken } from "../../middleware/token";
import authRoute from "./auth";
import {
  sendOTPController,
  verifyEmailController,
  verifyOTPController
} from "../../controllers/verification";
const v1route = express.Router();

v1route.get("/", (_, res) => {
  res.send("This is version one");
});
v1route.use(routes.user, verifyUserToken, userRoute);
v1route.use(routes.auth, authRoute);
v1route.post(routes.sendOTP, sendOTPController);
v1route.post(routes.verifyOTP, verifyOTPToken, verifyOTPController);
v1route.post(routes.verifyEmail, verifyEmailController);

export default v1route;
