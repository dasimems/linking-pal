import express from "express";
import { routes } from "../../utils/_variables";
import userRoute from "./user";
import { verifyUserToken } from "../../middleware/token";
const v1route = express.Router();

v1route.get("/", (_, res) => {
  res.send("This is version one");
});
v1route.use(routes.user, verifyUserToken, userRoute);

export default v1route;
