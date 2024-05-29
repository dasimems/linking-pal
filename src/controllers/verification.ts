import { SendOTPBody, VerifyOTPBody } from ".";
import UserSchema from "../models/UserSchema";
import { verificationTypes } from "../utils/_variables";
import {
  cacheEmailOTP,
  cacheForgotPasswordToken,
  cacheMobileNumberOTP,
  createUserDetails,
  fetchCachedEmailOTP,
  fetchCachedForgotPasswordOTP,
  fetchCachedMobileNumberOTP,
  generateOTP,
  generateToken,
  validateUser,
  validateValues
} from "../utils/functions";
import { emailRegExp, numberRegExp, phoneNumberRegExp } from "../utils/regex";
import {
  badRequestResponse,
  forbiddenResponse,
  getResponse,
  internalServerResponse,
  unauthorizedResponse
} from "../utils/responses";
import { CachedOTPType, ControllerType } from "../utils/types";

export const sendOTPController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const { email, mobile_number } = req.body as SendOTPBody;

    if (email && mobile_number) {
      response = {
        ...badRequestResponse,
        message: "Only one of email or mobile number is expected"
      };
    } else {
      if (!email && !mobile_number) {
        response = {
          ...badRequestResponse,
          message:
            "Please fill in either mobile number or email for verification"
        };
      } else {
        let expectedBody = {} as SendOTPBody;
        let errors: { [name: string]: string } = {};

        if (email) {
          const error = validateValues(
            { email },
            {
              email: {
                regex: {
                  value: emailRegExp,
                  message: "Please input a valid email address"
                }
              }
            }
          );

          if (error) {
            errors = {
              ...errors,
              ...error
            };
          } else {
            expectedBody = {
              ...expectedBody,
              email
            };
          }
        }

        if (mobile_number) {
          const error = validateValues(
            { mobile_number },
            {
              mobile_number: {
                regex: {
                  value: phoneNumberRegExp,
                  message: "Please input a valid mobile number"
                }
              }
            }
          );

          if (error) {
            errors = {
              ...errors,
              ...error
            };
          } else {
            expectedBody = {
              ...expectedBody,
              mobile_number
            };
          }
        }

        if (Object.keys(errors).length > 0) {
          response = {
            ...badRequestResponse,
            message: "Verification couldn't be processed",
            error: errors
          };
        } else {
          try {
            const user = email
              ? await UserSchema.findOne({
                  email
                })
              : await UserSchema.findOne({
                  mobile_number: mobile_number?.replace("+", "")
                });
            if (user) {
              const isVerified = email
                ? user.is_email_verified
                : user.is_phone_verified;

              if (isVerified) {
                response = {
                  ...badRequestResponse,
                  message: `Your ${
                    email ? "email" : "mobile number"
                  } is already verified`
                };
              } else {
                const otp = generateOTP();
                if (email) {
                  cacheEmailOTP(otp, user._id as unknown as string);
                } else {
                  cacheMobileNumberOTP(otp, user._id as unknown as string);
                }
                const token = await generateToken({
                  userId: user._id as unknown as string,
                  userAgent: req.headers["user-agent"] as string,
                  verificationType: email
                    ? verificationTypes.email
                    : verificationTypes.phone
                });
                response = {
                  ...getResponse,
                  message: `OTP sent to your ${
                    email ? "email address" : "mobile number"
                  } successfully. OTP is ${otp}`,
                  token
                };
              }
            } else {
              response = {
                ...unauthorizedResponse,
                message: `User not found`
              };
            }
          } catch (error) {
            // create error log
          }
        }
      }
    }

    res.status(response.status).json(response);
  },
  verifyOTPController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const { otp, verificationType } = req.body as VerifyOTPBody;

    const errors = validateValues(
      { otp },
      {
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
            value: numberRegExp,
            message: "Invalid OTP detected"
          }
        }
      }
    );

    if (errors) {
      response = {
        ...badRequestResponse,
        message: "Error occurred whilst verifying your OTP",
        error: errors
      };
    } else {
      if (
        verificationType !== verificationTypes.email &&
        verificationType !== verificationTypes.phone &&
        verificationType !== verificationTypes.forgotPassword
      ) {
        response = {
          ...badRequestResponse,
          message: "Invalid verification type"
        };
      } else {
        try {
          const user = await validateUser(req, res, true);

          if (user) {
            const isVerified =
              verificationType === verificationTypes.forgotPassword
                ? false
                : verificationType === verificationTypes.email
                ? user.is_email_verified
                : user.is_phone_verified;

            if (isVerified) {
              response = {
                ...badRequestResponse,
                message: `Your ${
                  verificationType === verificationTypes.email
                    ? "email"
                    : "mobile number"
                } is already verified`
              };
            } else {
              const savedOTP = (
                verificationType === verificationTypes.forgotPassword
                  ? fetchCachedForgotPasswordOTP(user._id as unknown as string)
                  : verificationType === verificationTypes.email
                  ? fetchCachedEmailOTP(user._id as unknown as string)
                  : fetchCachedMobileNumberOTP(user._id as unknown as string)
              ) as CachedOTPType;
              if (savedOTP) {
                if (savedOTP.otp === otp) {
                  response = {
                    ...getResponse,
                    message: `${
                      verificationType === verificationTypes.forgotPassword
                        ? "OTP"
                        : verificationType === verificationTypes.email
                        ? "Email"
                        : "Mobile number"
                    } verified successfully`
                  };

                  if (verificationType === verificationTypes.forgotPassword) {
                    const forgotPasswordToken = await generateToken({
                      userId: user._id as unknown as string,
                      userAgent: req.headers["user-agent"] as string,
                      verificationType: verificationTypes.forgotPassword
                    });
                    cacheForgotPasswordToken(
                      forgotPasswordToken,
                      user._id as unknown as string
                    );
                    response = {
                      ...response,
                      token: forgotPasswordToken
                    };
                  } else {
                    if (verificationType === verificationTypes.email) {
                      const newUserDetails = await user.updateOne(
                        {
                          is_email_verified: true
                        },
                        {
                          new: true
                        }
                      );

                      response = {
                        ...response,
                        data: {
                          ...createUserDetails(user),
                          is_email_verified: true
                        }
                      };
                    } else {
                      const newUserDetails = await user.updateOne(
                        {
                          is_phone_verified: true
                        },
                        {
                          new: true
                        }
                      );

                      response = {
                        ...response,
                        data: {
                          ...createUserDetails(user),
                          is_phone_verified: true
                        }
                      };
                    }
                  }
                } else {
                  response = {
                    ...unauthorizedResponse,
                    message: "Wrong otp detected"
                  };
                }
              } else {
                response = {
                  ...forbiddenResponse,
                  message: "OTP expired. Please request a new one"
                };
              }
            }
          } else {
            return;
          }
        } catch (error) {}
      }
    }

    res.status(response.status).json(response);
  },
  verifyEmailController: ControllerType = (req, res) => {
    res.send("this is to verify email");
  };
