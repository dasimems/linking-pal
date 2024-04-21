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
exports.forgetPasswordController = exports.signUpController = exports.loginController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const _variables_1 = require("../utils/_variables");
const functions_1 = require("../utils/functions");
const regex_1 = require("../utils/regex");
const responses_1 = require("../utils/responses");
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    let response = {
        message: "Internal Server error",
        status: 500
    };
    const errors = (0, functions_1.validateValues)(body, {
        email: {
            required: true,
            regex: regex_1.emailRegExp
        },
        password: {
            required: true
        }
    });
    if (errors) {
        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { error: errors });
    }
    else {
        const { email, password } = body;
        try {
            const user = yield UserSchema_1.default.findOne({
                email
            });
            if (!user) {
                response = Object.assign(Object.assign({}, responses_1.notFoundResponse), { message: "User not found" });
            }
            else {
                const isCorrectPassword = yield bcrypt_1.default.compare((0, functions_1.createPassword)(password), user.password);
                let token = null;
                token = yield (0, functions_1.generateToken)({
                    userId: user._id,
                    userAgent: req.headers["user-agent"]
                });
                const userDetails = (0, functions_1.createUserDetails)(user);
                if (isCorrectPassword) {
                    if (userDetails) {
                        response = Object.assign(Object.assign({}, responses_1.getResponse), { data: userDetails, token });
                    }
                    else {
                        //create log error
                    }
                }
                else {
                    response = Object.assign(Object.assign({}, responses_1.unauthorizedResponse), { message: "Incorrect password", error: {
                            password: "Incorrect password detected!"
                        } });
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    res.status(response.status).json(response);
}), signUpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const body = req.body;
    const errors = (0, functions_1.validateValues)(body, {
        name: true,
        email: {
            required: true,
            regex: {
                value: regex_1.emailRegExp,
                message: "Please input a valid email address"
            }
        },
        mobile_number: {
            required: true,
            regex: {
                value: regex_1.phoneNumberRegExp,
                message: "Please input a valid mobile number with it's country code."
            }
        },
        dob: {
            required: true,
            regex: {
                value: regex_1.dateRegExp,
                message: "Please input a valid Date Of Birth"
            }
        },
        bio: true,
        password: {
            required: true,
            regex: {
                value: regex_1.passwordRegExp,
                message: "Your password must be at least of 8 characters containing at least 1 uppercase character, lowercase characters, 1 number and one special character"
            },
            minLength: 8
        }
    });
    if (errors) {
        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { error: errors });
    }
    else {
        const { email, name, dob, bio, password: sentPassword, mobile_number } = body;
        const password = yield bcrypt_1.default.hash((0, functions_1.createPassword)(sentPassword), 10);
        try {
            const userEmailPromise = UserSchema_1.default.findOne({
                email
            });
            const userMobilePromise = UserSchema_1.default.findOne({
                mobile_number
            });
            const [userEmail, userMobile] = yield Promise.all([
                userEmailPromise,
                userMobilePromise
            ]);
            if (!userEmail && !userMobile) {
                const newUser = yield UserSchema_1.default.create({
                    email,
                    name,
                    dob,
                    bio,
                    password,
                    mobile_number
                });
                if (newUser) {
                    const token = yield (0, functions_1.generateToken)({
                        userId: newUser._id,
                        userAgent: req.headers["user-agent"]
                    });
                    const otp = (0, functions_1.generateOTP)();
                    const userDetails = (0, functions_1.createUserDetails)(newUser);
                    if (userDetails) {
                        response = Object.assign(Object.assign({}, responses_1.getResponse), { data: userDetails, token, message: `Account created successfully. Your OTP is ${otp}` });
                    }
                    else {
                        //create log error
                    }
                }
            }
            else {
                response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: `${userEmail && userMobile
                        ? "Email and mobile number"
                        : userEmail
                            ? "Email"
                            : "Mobile Number"} already exist. Please login instead` });
                if (userEmail) {
                    response = Object.assign(Object.assign({}, response), { error: Object.assign(Object.assign({}, response === null || response === void 0 ? void 0 : response.error), { email: "Email already exist in our database" }) });
                }
                if (userMobile) {
                    response = Object.assign(Object.assign({}, response), { error: Object.assign(Object.assign({}, response === null || response === void 0 ? void 0 : response.error), { mobile_number: "Mobile number already exist in our database" }) });
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    res.status(response.status).json(response);
}), forgetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const body = req.body;
    const errors = (0, functions_1.validateValues)(body, {
        email: {
            required: true,
            regex: {
                value: regex_1.emailRegExp,
                message: "Please provide a valid email address"
            }
        }
    });
    if (errors) {
        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { error: errors });
    }
    else {
        const { email } = body;
        try {
            const user = yield UserSchema_1.default.findOne({
                email
            });
            if (!user) {
                response = Object.assign(Object.assign({}, responses_1.notFoundResponse), { message: "User not found" });
            }
            else {
                // send otp to email
                const token = yield (0, functions_1.generateToken)({
                    userId: user._id,
                    userAgent: req.headers["user-agent"],
                    verificationType: _variables_1.verificationTypes.forgotPassword
                });
                response = Object.assign(Object.assign({}, responses_1.getResponse), { message: "A password reset OTP has been sent to your email.", token });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    res.status(response.status).json(response);
});
exports.loginController = loginController, exports.signUpController = signUpController, exports.forgetPasswordController = forgetPasswordController;
