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
exports.updateUserVideoController = exports.updateUserLocationController = exports.updateUserMoodController = exports.deleteUserDetailsController = exports.updateUserDetailsController = exports.getUserDetailsController = void 0;
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const responses_1 = require("../utils/responses");
const functions_1 = require("../utils/functions");
const regex_1 = require("../utils/regex");
const responses_2 = require("../utils/responses");
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
                }
                else {
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
            response = Object.assign(Object.assign({}, responses_2.processedResponse), { message: "User already deleted" });
        }
        else {
            return;
        }
    }
    catch (error) { }
    res.status(response.status).json(response);
}), updateUserMoodController = (req, res) => {
    res.send("this is to update user mood");
}, updateUserLocationController = (req, res) => {
    res.send("this is to update user location");
}, updateUserVideoController = (req, res) => {
    res.send("this is to update user video");
};
exports.getUserDetailsController = getUserDetailsController, exports.updateUserDetailsController = updateUserDetailsController, exports.deleteUserDetailsController = deleteUserDetailsController, exports.updateUserMoodController = updateUserMoodController, exports.updateUserLocationController = updateUserLocationController, exports.updateUserVideoController = updateUserVideoController;
