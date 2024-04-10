import { Algorithm } from "jsonwebtoken";

export const v1 = "/v1",
  v2 = "/v2",
  routes = {
    auth: "/auth",
    user: "/user",
    verifyOTP: "/verify-otp",
    sendOTP: "/send-otp",
    verifyEmail: "/verify-email"
  },
  subRoutes = {
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
  };
