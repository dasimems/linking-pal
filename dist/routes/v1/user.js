"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../../controllers/user");
const _variables_1 = require("../../utils/_variables");
const userRoute = express_1.default.Router();
userRoute
    .route("/")
    .get(user_1.getUserDetailsController)
    .patch(user_1.updateUserDetailsController)
    .delete(user_1.deleteUserDetailsController);
userRoute.route(_variables_1.subRoutes.mood).post(user_1.updateUserMoodController);
userRoute.route(_variables_1.subRoutes.location).post(user_1.updateUserLocationController);
userRoute.route(_variables_1.subRoutes.video).post(user_1.updateUserVideoController);
userRoute.route(_variables_1.subRoutes.image).post(user_1.updateUserAvatarController);
exports.default = userRoute;
