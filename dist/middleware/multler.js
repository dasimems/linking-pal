"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUpload = exports.videUpload = exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const videoStorage = multer_1.default.diskStorage({
    destination: "videos", // Destination to store video
    filename: (req, file, cb) => {
        const fileExt = file.originalname.split(".").pop();
        const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
        cb(null, filename);
    }
});
const postStorage = multer_1.default.diskStorage({
    destination: "post", // Destination to store video
    filename: (req, file, cb) => {
        const fileExt = file.originalname.split(".").pop();
        const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
        cb(null, filename);
    }
});
const imageStorage = multer_1.default.diskStorage({
    // Destination to store image
    destination: "images",
    filename: (req, file, cb) => {
        const fileExt = file.originalname.split(".").pop();
        const filename = `${file.fieldname}_${new Date().getTime()}.${fileExt}`;
        cb(null, filename);
    }
});
const imageUpload = (limit = 2000000) => (0, multer_1.default)({
    storage: imageStorage,
    limits: {
        fileSize: limit // defaults = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error("Please upload a JPG or PNG Image"));
        }
        cb(null, true);
    }
});
exports.imageUpload = imageUpload;
const videUpload = (limit = 10000000) => (0, multer_1.default)({
    storage: videoStorage,
    limits: {
        fileSize: limit // defaults = 10 MB
    },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
            return cb(new Error("Please upload a video"));
        }
        cb(null, true);
    }
});
exports.videUpload = videUpload;
const postUpload = (limit = 10000000) => (0, multer_1.default)({
    storage: postStorage,
    limits: {
        fileSize: limit // defaults = 10 MB
    },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|png|jpg)$/)) {
            return cb(new Error("Please upload a valid video or image file"));
        }
        cb(null, true);
    }
});
exports.postUpload = postUpload;
