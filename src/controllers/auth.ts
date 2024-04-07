import { LoginBody } from ".";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { verificationTypes } from "../utils/_variables";
import {
  createPassword,
  generateToken,
  validateValues
} from "../utils/functions";
import {
  dateRegExp,
  emailRegExp,
  passwordRegExp,
  phoneNumberRegExp
} from "../utils/regex";
import {
  badRequestResponse,
  getResponse,
  internalServerResponse,
  notFoundResponse,
  unauthorizedResponse
} from "../utils/responses";
import { ControllerType, ResponseType, UserDetailsType } from "../utils/types";

export const loginController: ControllerType = async (req, res) => {
    const body: LoginBody = req.body;
    let response: ResponseType = {
      message: "Internal Server error",
      status: 500
    };
    const errors = validateValues(body, {
      email: {
        required: true,
        regex: emailRegExp
      },
      password: {
        required: true
      }
    });

    if (errors) {
      response = {
        ...badRequestResponse,
        error: errors
      };
    } else {
      const email = req.body.username;
      const password = req.body.password;

      try {
        const user = await UserSchema.findOne({
          $or: [{ email }, { username: email }]
        });

        if (!user) {
          response = {
            ...notFoundResponse,
            message: "User not found"
          };
        } else {
          const isCorrectPassword = await bcrypt.compare(
            createPassword(password),
            user.password as string
          );

          let token = null;
          if (!user.is_phone_verified) {
            token = await generateToken({
              userId: user._id as unknown as string,
              userAgent: req.headers["user-agent"] as string,
              verificationType: verificationTypes.signup
            });
          } else {
            token = await generateToken({
              userId: user._id as unknown as string,
              userAgent: req.headers["user-agent"] as string
            });
          }
          const userDetails: UserDetailsType = {
            email: user.email as string,
            id: user._id as unknown as string,
            is_phone_verified: user.is_phone_verified,
            is_email_verified: user.is_email_verified,
            created_at: user.created_at,
            referred_by: user.referred_by
          };

          if (isCorrectPassword) {
            response = {
              ...getResponse,
              data: userDetails,
              token
            };
          } else {
            response = {
              ...unauthorizedResponse,
              message: "Incorrect password"
            };
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    res.status(response.status).json(response);
  },
  signUpController: ControllerType = (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const body = req.body;
    const errors = validateValues(body, {
      name: true,
      email: {
        required: true,
        regex: {
          value: emailRegExp,
          message: "Please input a valid email address"
        }
      },
      mobile_number: {
        required: true,
        regex: {
          value: phoneNumberRegExp,
          message: "Please input a valid mobile number with it's country code."
        }
      },
      dob: {
        required: true,
        regex: {
          value: dateRegExp,
          message: "Please input a valid Date Of Birth"
        }
      },
      bio: true,
      password: {
        required: true,
        regex: {
          value: passwordRegExp,
          message:
            "Your password must be at least of 8 characters containing at least 1 uppercase character, lowercase characters, 1 number and one special character"
        },
        minLength: 8
      }
    });

    if (errors) {
      response = {
        ...badRequestResponse,
        error: errors
      };
    } else {
    }
    res.status(response.status).json(response);
  },
  forgetPasswordController: ControllerType = (req, res) => {
    res.send("this is the login");
  };
