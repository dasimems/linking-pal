import {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  UserDetailsResponseType
} from ".";
import bcrypt from "bcrypt";
import UserSchema from "../models/UserSchema";
import { verificationTypes } from "../utils/_variables";
import {
  createPassword,
  createUserDetails,
  generateOTP,
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
import { ControllerType, ResponseType } from "../utils/types";

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
      const { email, password } = body;

      try {
        const user = await UserSchema.findOne({
          email
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

          token = await generateToken({
            userId: user._id as unknown as string,
            userAgent: req.headers["user-agent"] as string
          });
          const userDetails: UserDetailsResponseType | undefined =
            createUserDetails(user);

          if (isCorrectPassword) {
            if (userDetails) {
              response = {
                ...getResponse,
                data: userDetails,
                token
              };
            } else {
              //create log error
            }
          } else {
            response = {
              ...unauthorizedResponse,
              message: "Incorrect password",
              error: {
                password: "Incorrect password detected!"
              }
            };
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    res.status(response.status).json(response);
  },
  signUpController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const body: RegisterBody = req.body;
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
      const {
        email,
        name,
        dob,
        bio,
        password: sentPassword,
        mobile_number
      } = body;
      const password = await bcrypt.hash(createPassword(sentPassword), 10);
      try {
        const userEmailPromise = UserSchema.findOne({
          email
        });
        const userMobilePromise = UserSchema.findOne({
          mobile_number
        });
        const [userEmail, userMobile] = await Promise.all([
          userEmailPromise,
          userMobilePromise
        ]);
        if (!userEmail && !userMobile) {
          const newUser = await UserSchema.create({
            email,
            name,
            dob,
            bio,
            password,
            mobile_number
          });

          if (newUser) {
            const token = await generateToken({
              userId: newUser._id as unknown as string,
              userAgent: req.headers["user-agent"] as string
            });
            const otp = generateOTP();
            const userDetails: UserDetailsResponseType | undefined =
              createUserDetails(newUser);

            if (userDetails) {
              response = {
                ...getResponse,
                data: userDetails,
                token,
                message: `Account created successfully. Your OTP is ${otp}`
              };
            } else {
              //create log error
            }
          }
        } else {
          response = {
            ...badRequestResponse,
            message: `${
              userEmail && userMobile
                ? "Email and mobile number"
                : userEmail
                ? "Email"
                : "Mobile Number"
            } already exist. Please login instead`
          };

          if (userEmail) {
            response = {
              ...response,
              error: {
                ...response?.error,
                email: "Email already exist in our database"
              }
            };
          }
          if (userMobile) {
            response = {
              ...response,
              error: {
                ...response?.error,
                mobile_number: "Mobile number already exist in our database"
              }
            };
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    res.status(response.status).json(response);
  },
  forgetPasswordController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const body: ForgotPasswordBody = req.body;
    const errors = validateValues(body, {
      email: {
        required: true,
        regex: {
          value: emailRegExp,
          message: "Please provide a valid email address"
        }
      }
    });
    if (errors) {
      response = {
        ...badRequestResponse,
        error: errors
      };
    } else {
      const { email } = body;
      try {
        const user = await UserSchema.findOne({
          email
        });

        if (!user) {
          response = {
            ...notFoundResponse,
            message: "User not found"
          };
        } else {
          // send otp to email

          const token = await generateToken({
            userId: user._id as unknown as string,
            userAgent: req.headers["user-agent"] as string,
            verificationType: verificationTypes.forgotPassword
          });

          response = {
            ...getResponse,
            message: "A password reset OTP has been sent to your email.",
            token
          };
        }
      } catch (error) {
        console.log(error);
      }
    }
    res.status(response.status).json(response);
  };
