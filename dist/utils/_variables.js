"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expiringTimes = exports.otpKeys = exports.userTypes = exports.verificationTypes = exports.jwtAlgo = exports.subRoutes = exports.routes = exports.v2 = exports.v1 = void 0;
exports.v1 = "/v1", exports.v2 = "/v2", exports.routes = {
    auth: "/auth",
    user: "/user",
    verifyOTP: "/verify-otp",
    sendOTP: "/send-otp",
    verifyEmail: "/verify-email"
}, exports.subRoutes = {
    login: "/login",
    register: "/signup",
    image: "/image",
    address: "/locations",
    forgotPassword: "/forgot-password",
    referrals: "/referrals",
    changePassword: "/change-password",
    updateEmail: "/update-email",
    updateProfile: "/update-profile",
    mood: "/mood",
    location: "/location",
    video: "/video"
}, exports.jwtAlgo = "RS512", exports.verificationTypes = {
    forgotPassword: "forgot-password",
    phone: "phone",
    updateEmail: "update-email",
    email: "email"
}, exports.userTypes = {
    driver: "driver",
    passenger: "passenger"
}, exports.otpKeys = {
    email: "email",
    mobileNumber: "mobile-number",
    forgotPassword: "forgot-password",
    forgotPasswordToken: "forgot-password-token"
}, exports.expiringTimes = {
    otp: 300000
};
