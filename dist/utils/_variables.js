"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hour24Milliseconds = exports.expiringTimes = exports.otpKeys = exports.userTypes = exports.verificationTypes = exports.jwtAlgo = exports.cloudinaryFolderName = exports.subRoutes = exports.routes = exports.v2 = exports.v1 = void 0;
exports.v1 = "/v1", exports.v2 = "/v2", exports.routes = {
    auth: "/auth",
    user: "/user",
    post: "/post",
    verifyOTP: "/verify-otp",
    sendOTP: "/send-otp",
    verifyEmail: "/verify-email"
}, exports.subRoutes = {
    login: "/login",
    register: "/signup",
    image: "/image",
    nearby: "/nearby",
    address: "/locations",
    forgotPassword: "/forgot-password",
    referrals: "/referrals",
    changePassword: "/change-password",
    updateEmail: "/update-email",
    updateProfile: "/update-profile",
    mood: "/mood",
    location: "/location",
    video: "/video"
}, exports.cloudinaryFolderName = {
    video: "video-upload",
    image: "image-upload",
    post: "post-upload"
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
}, exports.hour24Milliseconds = 86400000;
