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
exports.verifyEmailController = exports.verifyOTPController = exports.sendOTPController = void 0;
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const _variables_1 = require("../utils/_variables");
const functions_1 = require("../utils/functions");
const regex_1 = require("../utils/regex");
const responses_1 = require("../utils/responses");
const sendOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const { email, mobile_number } = req.body;
    if (email && mobile_number) {
        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Only one of email or mobile number is expected" });
    }
    else {
        if (!email && !mobile_number) {
            response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Please fill in either mobile number or email for verification" });
        }
        else {
            let expectedBody = {};
            let errors = {};
            if (email) {
                const error = (0, functions_1.validateValues)({ email }, {
                    email: {
                        regex: {
                            value: regex_1.emailRegExp,
                            message: "Please input a valid email address"
                        }
                    }
                });
                if (error) {
                    errors = Object.assign(Object.assign({}, errors), error);
                }
                else {
                    expectedBody = Object.assign(Object.assign({}, expectedBody), { email });
                }
            }
            if (mobile_number) {
                const error = (0, functions_1.validateValues)({ mobile_number }, {
                    mobile_number: {
                        regex: {
                            value: regex_1.phoneNumberRegExp,
                            message: "Please input a valid mobile number"
                        }
                    }
                });
                if (error) {
                    errors = Object.assign(Object.assign({}, errors), error);
                }
                else {
                    expectedBody = Object.assign(Object.assign({}, expectedBody), { mobile_number });
                }
            }
            if (Object.keys(errors).length > 0) {
                response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Verification couldn't be processed", error: errors });
            }
            else {
                try {
                    const user = email
                        ? yield UserSchema_1.default.findOne({
                            email
                        })
                        : yield UserSchema_1.default.findOne({
                            mobile_number: mobile_number === null || mobile_number === void 0 ? void 0 : mobile_number.replace("+", "")
                        });
                    console.log(user);
                    if (user) {
                        const isVerified = email
                            ? user.is_email_verified
                            : user.is_phone_verified;
                        if (isVerified) {
                            response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: `Your ${email ? "email" : "mobile number"} is already verified` });
                        }
                        else {
                            const otp = (0, functions_1.generateOTP)();
                            if (email) {
                                (0, functions_1.cacheEmailOTP)(otp, user._id);
                            }
                            else {
                                (0, functions_1.cacheMobileNumberOTP)(otp, user._id);
                            }
                            const token = yield (0, functions_1.generateToken)({
                                userId: user._id,
                                userAgent: req.headers["user-agent"],
                                verificationType: email
                                    ? _variables_1.verificationTypes.email
                                    : _variables_1.verificationTypes.phone
                            });
                            response = Object.assign(Object.assign({}, responses_1.getResponse), { message: `OTP sent to your ${email ? "email address" : "mobile number"} successfully. OTP is ${otp}`, token });
                        }
                    }
                    else {
                        response = Object.assign(Object.assign({}, responses_1.unauthorizedResponse), { message: `User not found` });
                    }
                }
                catch (error) {
                    // create error log
                }
            }
        }
    }
    res.status(response.status).json(response);
}), verifyOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const { otp, verificationType } = req.body;
    const errors = (0, functions_1.validateValues)({ otp }, {
        otp: {
            required: {
                value: true,
                message: "Please provide your OTP"
            },
            maxLength: {
                value: 4,
                message: "Invalid OTP length"
            },
            minLength: {
                value: 4,
                message: "Invalid OTP length"
            },
            regex: {
                value: regex_1.numberRegExp,
                message: "Invalid OTP detected"
            }
        }
    });
    if (errors) {
        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Error occurred whilst verifying your OTP", error: errors });
    }
    else {
        if (verificationType !== _variables_1.verificationTypes.email &&
            verificationType !== _variables_1.verificationTypes.phone &&
            verificationType !== _variables_1.verificationTypes.forgotPassword) {
            response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Invalid verification type" });
        }
        else {
            try {
                const user = yield (0, functions_1.validateUser)(req, res, true);
                if (user) {
                    const isVerified = verificationType === _variables_1.verificationTypes.forgotPassword
                        ? false
                        : verificationType === _variables_1.verificationTypes.email
                            ? user.is_email_verified
                            : user.is_phone_verified;
                    if (isVerified) {
                        response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: `Your ${verificationType === _variables_1.verificationTypes.email
                                ? "email"
                                : "mobile number"} is already verified` });
                    }
                    else {
                        const savedOTP = (verificationType === _variables_1.verificationTypes.forgotPassword
                            ? (0, functions_1.fetchCachedForgotPasswordOTP)(user._id)
                            : verificationType === _variables_1.verificationTypes.email
                                ? (0, functions_1.fetchCachedEmailOTP)(user._id)
                                : (0, functions_1.fetchCachedMobileNumberOTP)(user._id));
                        console.log(savedOTP);
                        if (savedOTP) {
                            if (savedOTP.otp === otp) {
                                response = Object.assign(Object.assign({}, responses_1.getResponse), { message: `${verificationType === _variables_1.verificationTypes.forgotPassword
                                        ? "OTP"
                                        : verificationType === _variables_1.verificationTypes.email
                                            ? "Email"
                                            : "Mobile number"} verified successfully` });
                                if (verificationType === _variables_1.verificationTypes.forgotPassword) {
                                    const forgotPasswordToken = yield (0, functions_1.generateToken)({
                                        userId: user._id,
                                        userAgent: req.headers["user-agent"],
                                        verificationType: _variables_1.verificationTypes.forgotPassword
                                    });
                                    (0, functions_1.cacheForgotPasswordToken)(forgotPasswordToken, user._id);
                                    response = Object.assign(Object.assign({}, response), { token: forgotPasswordToken });
                                }
                                else {
                                    if (verificationType === _variables_1.verificationTypes.email) {
                                        const newUserDetails = yield user.updateOne({
                                            is_email_verified: true
                                        }, {
                                            new: true
                                        });
                                        response = Object.assign(Object.assign({}, response), { data: Object.assign(Object.assign({}, (0, functions_1.createUserDetails)(user)), { is_email_verified: true }) });
                                    }
                                    else {
                                        const newUserDetails = yield user.updateOne({
                                            is_phone_verified: true
                                        }, {
                                            new: true
                                        });
                                        response = Object.assign(Object.assign({}, response), { data: Object.assign(Object.assign({}, (0, functions_1.createUserDetails)(user)), { is_phone_verified: true }) });
                                    }
                                }
                            }
                            else {
                                response = Object.assign(Object.assign({}, responses_1.unauthorizedResponse), { message: "Wrong otp detected" });
                            }
                        }
                        else {
                            response = Object.assign(Object.assign({}, responses_1.forbiddenResponse), { message: "OTP expired. Please request a new one" });
                        }
                    }
                }
                else {
                    return;
                }
            }
            catch (error) { }
        }
    }
    res.status(response.status).json(response);
}), verifyEmailController = (req, res) => {
    res.send("this is to verify email");
};
exports.sendOTPController = sendOTPController, exports.verifyOTPController = verifyOTPController, exports.verifyEmailController = verifyEmailController;
