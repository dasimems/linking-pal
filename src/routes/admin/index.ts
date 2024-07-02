import express from "express";
import dashboardRoute from "./dashboard";
import loginRoute from "./login";
import { defaultVarsMiddleware } from "../../middleware/admin";
const adminRoute = express.Router();
adminRoute.use(defaultVarsMiddleware);
adminRoute.use(loginRoute);
adminRoute.use(dashboardRoute);
adminRoute.use(express.urlencoded({ extended: true }));

export default adminRoute;
