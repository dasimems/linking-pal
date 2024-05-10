"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const _variables_1 = require("../../utils/_variables");
const user_1 = __importDefault(require("./user"));
const token_1 = require("../../middleware/token");
const auth_1 = __importDefault(require("./auth"));
const verification_1 = require("../../controllers/verification");
const post_1 = __importDefault(require("./post"));
const v1route = express_1.default.Router();
v1route.get("/", (_, res) => {
    res.send("This is version one");
});
v1route.use(_variables_1.routes.user, token_1.verifyUserToken, user_1.default);
v1route.use(_variables_1.routes.post, token_1.verifyUserToken, post_1.default);
v1route.use(_variables_1.routes.auth, auth_1.default);
v1route.post(_variables_1.routes.sendOTP, verification_1.sendOTPController);
v1route.post(_variables_1.routes.verifyOTP, token_1.verifyOTPToken, verification_1.verifyOTPController);
v1route.post(_variables_1.routes.verifyEmail, verification_1.verifyEmailController);
exports.default = v1route;
