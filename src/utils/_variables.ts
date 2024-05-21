import { Algorithm } from "jsonwebtoken";

export const v1 = "/v1",
  v2 = "/v2",
  routes = {
    auth: "/auth",
    user: "/user",
    post: "/post",
    notification: "/notification",
    verifyOTP: "/verify-otp",
    sendOTP: "/send-otp",
    verifyEmail: "/verify-email"
  },
  subRoutes = {
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
    all: "/all",
    location: "/location",
    video: "/video"
  },
  cloudinaryFolderName = {
    video: "video-upload",
    image: "image-upload",
    post: "post-upload"
  },
  jwtAlgo: Algorithm = "RS512",
  verificationTypes = {
    forgotPassword: "forgot-password",
    phone: "phone",
    updateEmail: "update-email",
    email: "email"
  },
  userTypes = {
    driver: "driver",
    passenger: "passenger"
  },
  otpKeys = {
    email: "email",
    mobileNumber: "mobile-number",
    forgotPassword: "forgot-password",
    forgotPasswordToken: "forgot-password-token"
  },
  expiringTimes = {
    otp: 300000
  },
  dbCollectionNames = {
    notification: "notification",
    post: "post",
    user: "user",
    like: "like",
    comment: "comment",
    chat: "chat"
  },
  hour24Milliseconds = 86400000;
