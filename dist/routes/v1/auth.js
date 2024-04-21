"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const _variables_1 = require("../../utils/_variables");
const auth_1 = require("../../controllers/auth");
const authRoute = express_1.default.Router();
authRoute.post(_variables_1.subRoutes.login, auth_1.loginController);
authRoute.post(_variables_1.subRoutes.register, auth_1.signUpController);
authRoute.post(_variables_1.subRoutes.forgotPassword, auth_1.forgetPasswordController);
exports.default = authRoute;
