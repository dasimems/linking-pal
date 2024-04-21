"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const v2route = express_1.default.Router();
v2route.get("/", (_, res) => {
    res.send("Version 2 under construction. Please visit back later");
});
exports.default = v2route;
