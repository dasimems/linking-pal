import express from "express";
import { subRoutes, routes } from "../../utils/_variables";
import { getChannelController } from "../../controllers/chat";
const chatRoute = express.Router();

chatRoute.route(`${subRoutes.channel}/:id`).get(getChannelController);

export default chatRoute;
