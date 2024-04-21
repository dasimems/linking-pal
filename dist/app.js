"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.env = process.env;
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: false }));
mongoose_1.default
    .connect(exports.env.CLOUD_CONNECTION_STRING)
    .then(() => {
    console.log("Database connected");
})
    .catch((err) => {
    console.log(err);
});
exports.app.use(routes_1.default);
exports.app.get("/", (req, res) => {
    res.send("Welcome dear");
});
