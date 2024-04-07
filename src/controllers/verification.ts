import { ControllerType } from "../utils/types";

export const sendOTPController: ControllerType = (req, res) => {
    res.send("this is to send otp");
  },
  verifyOTPController: ControllerType = (req, res) => {
    res.send("this is to verify otp");
  },
  verifyEmailController: ControllerType = (req, res) => {
    res.send("this is to verify email");
  };
