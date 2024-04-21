"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const _variables_1 = require("../utils/_variables");
const v1_1 = __importDefault(require("./v1"));
const v2_1 = __importDefault(require("./v2"));
const routes = express_1.default.Router();
routes.use(_variables_1.v1, v1_1.default);
routes.use(_variables_1.v2, v2_1.default);
exports.default = routes;
