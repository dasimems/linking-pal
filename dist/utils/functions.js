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
exports.sendMail = exports.generateOTP = exports.reverseToken = exports.generateToken = exports.createPassword = exports.fetchCacheEmail = exports.cacheEmail = exports.fetchCachedForgotPasswordToken = exports.cacheForgotPasswordToken = exports.fetchCachedForgotPasswordOTP = exports.cacheForgotPasswordOTP = exports.fetchCachedMobileNumberOTP = exports.cacheMobileNumberOTP = exports.fetchCachedEmailOTP = exports.cacheEmailOTP = exports.createUserDetails = exports.generateCacheKey = exports.validateUser = exports.validateValues = exports.doRequestBodyHaveError = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const UserSchema_1 = __importDefault(require("../models/UserSchema"));
const responses_1 = require("./responses");
const _variables_1 = require("./_variables");
dotenv_1.default.config();
const env = process.env;
const cache = new node_cache_1.default({ stdTTL: 100, checkperiod: 120 });
const nonExpiringCache = new node_cache_1.default({ stdTTL: 0 });
const doRequestBodyHaveError = (data, keys) => {
    const dataKeys = Object.keys(data);
    let error = null;
    keys.forEach((key) => {
        if (key && key.length > 0) {
            if (!dataKeys.includes(key)) {
                error = Object.assign(Object.assign({}, error), { [key]: `Please provide ${key}` });
            }
        }
    });
    if (error) {
        return error;
    }
    else {
        return false;
    }
};
exports.doRequestBodyHaveError = doRequestBodyHaveError;
const validateValues = (data, validation) => {
    let error = null;
    if (!data || typeof data !== "object") {
        data = {};
    }
    if (data &&
        typeof data === "object" &&
        validation &&
        typeof validation === "object") {
        const validationKeys = Object.keys(validation);
        validationKeys.forEach((key) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            const value = data[key];
            const validationValue = validation[key];
            if (validationValue) {
                console.log(validationValue.maxLength &&
                    !isNaN(Number(validationValue.maxLength)) &&
                    value.toString().length < validationValue.maxLength);
                console.log(((_a = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _a === void 0 ? void 0 : _a.value) &&
                    !isNaN(Number((_b = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _b === void 0 ? void 0 : _b.value)) &&
                    value.toString().length < ((_c = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _c === void 0 ? void 0 : _c.value));
                if (typeof validationValue !== "object" &&
                    (!value || value.length < 1)) {
                    error = Object.assign(Object.assign({}, error), { [key]: `Please provide your ${key}` });
                }
                else {
                    if ((validationValue.required || ((_d = validationValue === null || validationValue === void 0 ? void 0 : validationValue.required) === null || _d === void 0 ? void 0 : _d.value)) &&
                        (!value || value.length < 1)) {
                        error = Object.assign(Object.assign({}, error), { [key]: validationValue.required.message || `Please provide your ${key}` });
                    }
                    else if (!isNaN(Number(value)) &&
                        ((validationValue.min &&
                            !isNaN(Number(validationValue.min)) &&
                            Number(value) < validationValue.min) ||
                            (((_e = validationValue === null || validationValue === void 0 ? void 0 : validationValue.min) === null || _e === void 0 ? void 0 : _e.value) &&
                                !isNaN(Number((_f = validationValue === null || validationValue === void 0 ? void 0 : validationValue.min) === null || _f === void 0 ? void 0 : _f.value)) &&
                                Number(value) < validationValue.min.value))) {
                        error = Object.assign(Object.assign({}, error), { [key]: ((_g = validationValue === null || validationValue === void 0 ? void 0 : validationValue.min) === null || _g === void 0 ? void 0 : _g.message) ||
                                `Your ${key} must not be less than ${validation.min}` });
                    }
                    else if (!isNaN(Number(value)) &&
                        ((validationValue.max &&
                            !isNaN(Number(validationValue.max)) &&
                            Number(value) > validationValue.max) ||
                            (((_h = validationValue === null || validationValue === void 0 ? void 0 : validationValue.max) === null || _h === void 0 ? void 0 : _h.value) &&
                                !isNaN(Number((_j = validationValue === null || validationValue === void 0 ? void 0 : validationValue.max) === null || _j === void 0 ? void 0 : _j.value)) &&
                                Number(value) > ((_k = validationValue === null || validationValue === void 0 ? void 0 : validationValue.max) === null || _k === void 0 ? void 0 : _k.value)))) {
                        error = Object.assign(Object.assign({}, error), { [key]: ((_l = validationValue === null || validationValue === void 0 ? void 0 : validationValue.max) === null || _l === void 0 ? void 0 : _l.message) ||
                                `Your ${key} must not be greater than ${validation.max}` });
                    }
                    else if ((validationValue.minLength &&
                        !isNaN(Number(validationValue.minLength)) &&
                        value.toString().length < validationValue.minLength) ||
                        (((_m = validationValue === null || validationValue === void 0 ? void 0 : validationValue.minLength) === null || _m === void 0 ? void 0 : _m.value) &&
                            !isNaN(Number((_o = validationValue === null || validationValue === void 0 ? void 0 : validationValue.minLength) === null || _o === void 0 ? void 0 : _o.value)) &&
                            value.toString().length < ((_p = validationValue === null || validationValue === void 0 ? void 0 : validationValue.minLength) === null || _p === void 0 ? void 0 : _p.value))) {
                        error = Object.assign(Object.assign({}, error), { [key]: ((_q = validationValue === null || validationValue === void 0 ? void 0 : validationValue.minLength) === null || _q === void 0 ? void 0 : _q.message) ||
                                `Your ${key} must not be less than ${validation.minLength} characters` });
                    }
                    else if ((validationValue.maxLength &&
                        !isNaN(Number(validationValue.maxLength)) &&
                        value.toString().length > validationValue.maxLength) ||
                        (((_r = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _r === void 0 ? void 0 : _r.value) &&
                            !isNaN(Number((_s = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _s === void 0 ? void 0 : _s.value)) &&
                            value.toString().length > ((_t = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _t === void 0 ? void 0 : _t.value))) {
                        error = Object.assign(Object.assign({}, error), { [key]: ((_u = validationValue === null || validationValue === void 0 ? void 0 : validationValue.maxLength) === null || _u === void 0 ? void 0 : _u.message) ||
                                `Your ${key} must not be greater than ${validation.maxLength} characters` });
                    }
                    else if ((validationValue.regex &&
                        !((_v = validationValue === null || validationValue === void 0 ? void 0 : validationValue.regex) === null || _v === void 0 ? void 0 : _v.value) &&
                        !validationValue.regex.test(value)) ||
                        (((_w = validationValue === null || validationValue === void 0 ? void 0 : validationValue.regex) === null || _w === void 0 ? void 0 : _w.value) &&
                            !((_x = validationValue === null || validationValue === void 0 ? void 0 : validationValue.regex) === null || _x === void 0 ? void 0 : _x.value.test(value)))) {
                        error = Object.assign(Object.assign({}, error), { [key]: ((_y = validationValue === null || validationValue === void 0 ? void 0 : validationValue.regex) === null || _y === void 0 ? void 0 : _y.message) || `Please input a valid ${key}` });
                    }
                }
            }
        });
    }
    return error;
};
exports.validateValues = validateValues;
const validateUser = (req, res, omitVerification) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.unauthorizedResponse);
    const { userId } = req.body;
    try {
        const user = yield UserSchema_1.default.findById(userId);
        if (user) {
            if (!user.is_phone_verified || !user.is_email_verified) {
                response = Object.assign(Object.assign({}, responses_1.forbiddenResponse), { message: `Please verify your ${!user.is_phone_verified && !user.is_email_verified
                        ? "email address and mobile number"
                        : !user.is_email_verified
                            ? "email address"
                            : "mobile number"}` });
                if (omitVerification) {
                    return user;
                }
            }
            else {
                return user;
            }
        }
        else {
            res.status(response.status).json(response);
        }
    }
    catch (error) {
        // create error log
    }
    return;
});
exports.validateUser = validateUser;
const generateCacheKey = (extension, id) => {
    return `${extension}-${id}`;
};
exports.generateCacheKey = generateCacheKey;
const createUserDetails = (user) => {
    if (user) {
        return {
            email: user.email,
            id: user._id,
            is_phone_verified: user.is_phone_verified,
            is_email_verified: user.is_email_verified,
            is_verified: user.is_verified,
            has_subscribed: user.has_subscribed,
            created_at: user.created_at,
            updated_at: user.updated_at,
            video: user.video,
            name: user.name,
            bio: user.bio,
            dob: user.dob,
            mood: user.mood,
            mobile_number: user.mobile_number
        };
    }
};
exports.createUserDetails = createUserDetails;
const cacheEmailOTP = (otp, id) => {
    return cache.set((0, exports.generateCacheKey)(_variables_1.otpKeys.email, id), { otp }, _variables_1.expiringTimes.otp);
};
exports.cacheEmailOTP = cacheEmailOTP;
const fetchCachedEmailOTP = (id) => {
    return cache.get((0, exports.generateCacheKey)(_variables_1.otpKeys.email, id));
};
exports.fetchCachedEmailOTP = fetchCachedEmailOTP;
const cacheMobileNumberOTP = (otp, id) => {
    return cache.set((0, exports.generateCacheKey)(_variables_1.otpKeys.mobileNumber, id), { otp }, _variables_1.expiringTimes.otp);
};
exports.cacheMobileNumberOTP = cacheMobileNumberOTP;
const fetchCachedMobileNumberOTP = (id) => {
    return cache.get((0, exports.generateCacheKey)(_variables_1.otpKeys.mobileNumber, id));
};
exports.fetchCachedMobileNumberOTP = fetchCachedMobileNumberOTP;
const cacheForgotPasswordOTP = (otp, id) => {
    return cache.set((0, exports.generateCacheKey)(_variables_1.otpKeys.forgotPassword, id), { otp }, _variables_1.expiringTimes.otp);
};
exports.cacheForgotPasswordOTP = cacheForgotPasswordOTP;
const fetchCachedForgotPasswordOTP = (id) => {
    return cache.get((0, exports.generateCacheKey)(_variables_1.otpKeys.forgotPassword, id));
};
exports.fetchCachedForgotPasswordOTP = fetchCachedForgotPasswordOTP;
const cacheForgotPasswordToken = (token, id) => {
    return cache.set((0, exports.generateCacheKey)(_variables_1.otpKeys.forgotPasswordToken, id), { token }, _variables_1.expiringTimes.otp * 2);
};
exports.cacheForgotPasswordToken = cacheForgotPasswordToken;
const fetchCachedForgotPasswordToken = (id) => {
    return cache.get((0, exports.generateCacheKey)(_variables_1.otpKeys.forgotPasswordToken, id));
};
exports.fetchCachedForgotPasswordToken = fetchCachedForgotPasswordToken;
const cacheEmail = (email, username) => {
    return nonExpiringCache.set(username, { email });
};
exports.cacheEmail = cacheEmail;
const fetchCacheEmail = (username) => {
    return nonExpiringCache.get(username);
};
exports.fetchCacheEmail = fetchCacheEmail;
const createPassword = (password) => {
    if (password) {
        return `${password}-${env.PASSWORD_KEY}`;
    }
    else {
        console.error("Expected the password as a parameter");
        return "";
    }
};
exports.createPassword = createPassword;
const generateToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data) {
        return jsonwebtoken_1.default.sign(data, env.SECRET_KEY);
    }
    else {
        console.error("Please pass in the data to be encrypted");
        return "";
    }
});
exports.generateToken = generateToken;
const reverseToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (token) {
        return jsonwebtoken_1.default.verify(token, env.SECRET_KEY);
    }
    else {
        console.error("Expected your token as parameter");
    }
});
exports.reverseToken = reverseToken;
const generateOTP = (length = 4) => {
    let otp = "";
    for (var i = 0; i < length; i++) {
        const randomNumber = Math.random() * 9;
        otp = otp + Math.floor(randomNumber);
    }
    console.log(parseInt("0124", 10));
    return otp;
};
exports.generateOTP = generateOTP;
const sendMail = ({ sender, receiver, subject, message }) => {
    return new Promise((res, rej) => {
        var transporter = nodemailer_1.default.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "e75ba9eff40919",
                pass: "2eec2377be0b35"
            }
        });
        var mailOptions = {
            from: sender,
            to: receiver,
            subject: subject,
            text: message
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                rej(error);
            }
            else {
                res(info);
            }
        });
    });
};
exports.sendMail = sendMail;
