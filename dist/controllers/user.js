"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserAvatarController = exports.updateUserVideoController = exports.updateUserLocationController = exports.updateUserMoodController = exports.deleteUserDetailsController = exports.updateUserDetailsController = exports.getUserDetailsController = void 0;
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const responses_1 = require("../utils/responses");
const functions_1 = require("../utils/functions");
const fs_1 = __importDefault(require("fs"));
const regex_1 = require("../utils/regex");
const responses_2 = require("../utils/responses");
const _variables_1 = require("../utils/_variables");
const multler_1 = require("../middleware/multler");
const multer_1 = __importDefault(require("multer"));
const get_video_duration_1 = __importDefault(require("get-video-duration"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const getUserDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    try {
        const user = yield (0, functions_1.validateUser)(req, res, true);
        if (user) {
            const data = (0, functions_1.createUserDetails)(user);
            response = Object.assign(Object.assign({}, responses_1.getResponse), { data });
        }
        else {
            return;
        }
    }
    catch (error) {
        // create log error
    }
    res.status(response.status).json(response);
}), updateUserDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const { name, bio, dob, userId } = req.body;
    let expectedBody = {};
    let errors = null;
    if (name) {
        expectedBody = Object.assign(Object.assign({}, expectedBody), { name });
    }
    if (bio) {
        expectedBody = Object.assign(Object.assign({}, expectedBody), { bio });
    }
    if (dob) {
        const error = (0, functions_1.validateValues)({ dob }, {
            dob: {
                regex: {
                    value: regex_1.dateRegExp,
                    message: "Please provide a valid Date of Birth"
                }
            }
        });
        console.log(error);
        if (error) {
            let availableErrors = errors || {};
            errors = Object.assign(Object.assign({}, availableErrors), error);
        }
        expectedBody = Object.assign(Object.assign({}, expectedBody), { dob });
    }
    if (errors) {
        response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { error: errors });
    }
    else {
        if (Object.keys(expectedBody).length < 1) {
            response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: "One of either values must be provided. Name, DOB, Bio" });
        }
        else {
            expectedBody = Object.assign(Object.assign({}, expectedBody), { updated_at: new Date() });
            try {
                const user = yield (0, functions_1.validateUser)(req, res, true);
                if (user) {
                    console.log(expectedBody);
                    const newDetails = yield UserSchema_1.default.findByIdAndUpdate(userId, Object.assign({}, expectedBody), { new: true });
                    console.log(newDetails);
                    const userDetails = (0, functions_1.createUserDetails)(newDetails);
                    response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "Update successful", data: userDetails });
                    return;
                }
            }
            catch (error) { }
        }
    }
    res.status(response.status).json(response);
}), deleteUserDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const { userId } = req.body;
    try {
        const user = yield (0, functions_1.validateUser)(req, res);
        if (user) {
            const _ = yield UserSchema_1.default.findByIdAndDelete(userId);
            response = Object.assign(Object.assign({}, responses_2.processedResponse), { message: "User deleted successfully" });
        }
        else {
            return;
        }
    }
    catch (error) { }
    res.status(response.status).json(response);
}), updateUserMoodController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { mood } = body;
    const user = yield (0, functions_1.validateUser)(req, res);
    let response = Object.assign({}, responses_1.internalServerResponse);
    if (!mood || !Array.isArray(mood)) {
        response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: mood
                ? "Invalid mood type detected! Mood must be an array"
                : "Please provide your mood" });
    }
    else {
        if (user) {
            let errors = null;
            if (mood.length < 1) {
                if (!errors) {
                    errors = {};
                }
                errors = Object.assign(Object.assign({}, errors), { mood: "Please provide at least one mood" });
            }
            if (mood.length > 1 && !user.has_subscribed) {
                if (!errors) {
                    errors = {};
                }
                errors = Object.assign(Object.assign({}, errors), { mood: "You can't select add than one mood. Please subscribe to add more than one mood" });
            }
            if (errors) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { error: errors });
            }
            if (!errors) {
                const lastUpdated = new Date(user.mood_last_updated || Date.now()).getTime();
                const presentDate = new Date().getTime();
                if (user.mood_last_updated &&
                    !user.has_subscribed &&
                    presentDate - lastUpdated < _variables_1.hour24Milliseconds) {
                    response = Object.assign(Object.assign({}, responses_1.forbiddenResponse), { message: "You can only update your mood once in 24 hours. Subscribe to remove the restriction" });
                }
                if (!user.mood_last_updated ||
                    user.has_subscribed ||
                    (user.mood_last_updated &&
                        !user.has_subscribed &&
                        presentDate - lastUpdated >= _variables_1.hour24Milliseconds)) {
                    try {
                        const newDetails = yield UserSchema_1.default.findByIdAndUpdate(user.id, {
                            mood,
                            mood_last_updated: new Date()
                        }, { new: true });
                        const userDetails = (0, functions_1.createUserDetails)(newDetails);
                        response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "Mood updated successful", data: userDetails });
                    }
                    catch (error) { }
                }
            }
        }
        else {
            return;
        }
    }
    res.status(response.status).json(response);
}), updateUserLocationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { latitude, longitude } = body;
    const user = yield (0, functions_1.validateUser)(req, res);
    let response = Object.assign({}, responses_1.internalServerResponse);
    const errors = (0, functions_1.validateValues)(body, {
        latitude: {
            required: {
                value: true,
                message: "Please provide your latitude"
            },
            regex: {
                value: regex_1.coordinateRegExp,
                message: "Please input a valid latitude"
            }
        },
        longitude: {
            required: {
                value: true,
                message: "Please provide your longitude"
            },
            regex: {
                value: regex_1.coordinateRegExp,
                message: "Please input a valid longitude"
            }
        }
    });
    if (errors) {
        response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { error: errors });
    }
    if (!errors) {
        if (user) {
            try {
                const _ = yield UserSchema_1.default.findByIdAndUpdate(user.id, {
                    longitude,
                    latitude
                }, { new: true });
                response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "Location updated successful" });
            }
            catch (error) { }
        }
        else {
            return;
        }
    }
    res.status(response.status).json(response);
}), updateUserVideoController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, functions_1.validateUser)(req, res);
    let response = Object.assign({}, responses_1.internalServerResponse);
    const upload = (0, multler_1.videUpload)().single("video");
    if (user) {
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err instanceof multer_1.default.MulterError) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: err.message || "Unidentified error occurred while uploading" });
                res.status(response.status).json(response);
                return;
            }
            else if (err) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error occurred while uploading!" });
                res.status(response.status).json(response);
                return;
            }
            if (!req.file && !err) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: "Please upload a video" });
                return res.status(response.status).json(response);
            }
            if (!err && req.file) {
                const { path } = req.file;
                console.log("path", path);
                try {
                    const duration = yield (0, get_video_duration_1.default)(path);
                    if (duration > (0, functions_1.convertMinToSecs)(1.5)) {
                        response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: "Please upload video not more than 90 secs" });
                        fs_1.default.unlinkSync(path);
                        res.status(response.status).json(response);
                        return;
                    }
                    else {
                        const fName = req.file.originalname.split(".")[0].split(" ")[0];
                        const userFileName = (0, functions_1.getFileRoute)(user.id, fName);
                        if (user.video) {
                            const splittedUserVideo = user.video.split("/");
                            const videoFileName = splittedUserVideo[splittedUserVideo.length - 1];
                            const saveFileRoute = (0, functions_1.getFileRoute)(user.id, videoFileName);
                            const publicId = (0, functions_1.getCloudinaryPublicId)(saveFileRoute, "video").split(".")[0];
                            if (publicId) {
                                console.log("previousId", publicId);
                                const deleting = yield cloudinary_1.default.uploader.destroy(publicId, {
                                    resource_type: "video",
                                    invalidate: true
                                });
                                console.log(deleting);
                            }
                        }
                        console.log("fileName", userFileName);
                        cloudinary_1.default.uploader.upload(path, {
                            resource_type: "video",
                            public_id: (0, functions_1.getCloudinaryPublicId)(userFileName, "video")
                        }, (err, video) => __awaiter(void 0, void 0, void 0, function* () {
                            fs_1.default.unlinkSync(path);
                            if (err) {
                                response = Object.assign(Object.assign({}, responses_1.internalServerResponse), { message: err === null || err === void 0 ? void 0 : err.message });
                                return res.status(response.status).json(response);
                            }
                            if (!err) {
                                console.log(video);
                                const newDetails = yield UserSchema_1.default.findByIdAndUpdate(user.id, {
                                    video: video === null || video === void 0 ? void 0 : video.secure_url,
                                    updated_at: new Date()
                                }, { new: true });
                                const userDetails = (0, functions_1.createUserDetails)(newDetails);
                                response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "Video Updated successfully", data: userDetails });
                                return res.status(response.status).json(response);
                            }
                        }));
                    }
                    return;
                }
                catch (error) {
                    response.message =
                        "Internal server error! Unable to determine video duration";
                    res.status(response.status).json(response);
                    return;
                }
            }
        }));
    }
    else {
        return;
    }
    // res.status(response.status).json(response);
}), updateUserAvatarController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const user = yield (0, functions_1.validateUser)(req, res);
    const upload = (0, multler_1.imageUpload)().single("avatar");
    if (user) {
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err instanceof multer_1.default.MulterError) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: err.message || "Unidentified error occurred while uploading" });
                res.status(response.status).json(response);
                return;
            }
            else if (err) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error occurred while uploading!" });
                res.status(response.status).json(response);
                return;
            }
            if (!req.file && !err) {
                response = Object.assign(Object.assign({}, responses_2.badRequestResponse), { message: "Please upload an image" });
                return res.status(response.status).json(response);
            }
            if (!err && req.file) {
                const { path } = req.file;
                try {
                    const fName = req.file.originalname.split(".")[0].split(" ")[0];
                    const userFileName = (0, functions_1.getFileRoute)(user.id, fName);
                    if (user.avatar) {
                        const splittedUserVideo = user.avatar.split("/");
                        const imageFileName = splittedUserVideo[splittedUserVideo.length - 1];
                        const saveFileRoute = (0, functions_1.getFileRoute)(user.id, imageFileName);
                        const publicId = (0, functions_1.getCloudinaryPublicId)(saveFileRoute, "image").split(".")[0];
                        if (publicId) {
                            console.log("previousId", publicId);
                            const deleting = yield cloudinary_1.default.uploader.destroy(publicId, {
                                resource_type: "image",
                                invalidate: true
                            });
                            console.log(deleting);
                        }
                    }
                    cloudinary_1.default.uploader.upload(path, {
                        resource_type: "image",
                        public_id: (0, functions_1.getCloudinaryPublicId)(userFileName, "image")
                    }, (err, image) => __awaiter(void 0, void 0, void 0, function* () {
                        fs_1.default.unlinkSync(path);
                        if (err) {
                            response = Object.assign(Object.assign({}, responses_1.internalServerResponse), { message: err === null || err === void 0 ? void 0 : err.message });
                            return res.status(response.status).json(response);
                        }
                        if (!err) {
                            console.log(image);
                            const newDetails = yield UserSchema_1.default.findByIdAndUpdate(user.id, {
                                avatar: image === null || image === void 0 ? void 0 : image.secure_url,
                                updated_at: new Date()
                            }, { new: true });
                            const userDetails = (0, functions_1.createUserDetails)(newDetails);
                            response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "Profile picture updated successfully", data: userDetails });
                            return res.status(response.status).json(response);
                        }
                    }));
                    return;
                }
                catch (error) {
                    response.message = "Internal server error! Unable to upload image";
                    res.status(response.status).json(response);
                    return;
                }
            }
        }));
    }
    else {
        return;
    }
});
exports.getUserDetailsController = getUserDetailsController, exports.updateUserDetailsController = updateUserDetailsController, exports.deleteUserDetailsController = deleteUserDetailsController, exports.updateUserMoodController = updateUserMoodController, exports.updateUserLocationController = updateUserLocationController, exports.updateUserVideoController = updateUserVideoController, exports.updateUserAvatarController = updateUserAvatarController;
