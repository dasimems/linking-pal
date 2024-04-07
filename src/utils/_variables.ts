import { Algorithm } from "jsonwebtoken";

export const v1 = "/v1",
  v2 = "/v2",
  routes = {
    auth: "/auth",
    user: "/user",
    verifyOTP: "/verify-otp",
    resendOTP: "/resend-otp"
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
    updateProfile: "/update-profile"
  },
  jwtAlgo: Algorithm = "RS512",
  verificationTypes = {
    forgotPassword: "forgot-password",
    signup: "signup",
    updateEmail: "update-email"
  },
  userTypes = {
    driver: "driver",
    passenger: "passenger"
  };
