import express from "express";
import { v1, v2 } from "../utils/_variables";
import v1route from "./v1";
import v2route from "./v2";
const routes = express.Router();

routes.use(v1, v1route);
routes.use(v2, v2route);

export default routes;
