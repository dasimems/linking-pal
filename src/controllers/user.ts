import { AUthorizedBody, UpdateProfileBody } from ".";
import UserSchema from "../models/UserSchema";
import { ControllerType } from "../utils/types";
import {
  internalServerResponse,
  getResponse,
  unauthorizedResponse
} from "../utils/responses";
import { createUserDetails, validateValues } from "../utils/functions";
import { dateRegExp } from "../utils/regex";
import { badRequestResponse, processedResponse } from "../utils/responses";

export const getUserDetailsController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const { userId } = req.body as AUthorizedBody;

    try {
      const user = await UserSchema.findById(userId);
      if (user) {
        const data = createUserDetails(user);

        response = {
          ...getResponse,
          data
        };
      } else {
        response = {
          ...unauthorizedResponse
        };
      }
    } catch (error) {
      // create log error
    }

    res.status(response.status).json(response);
  },
  updateUserDetailsController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const { name, bio, dob, userId } = req.body as UpdateProfileBody;
    let expectedBody = {};
    let errors: { [name: string]: string } | null = null;
    if (name) {
      expectedBody = {
        ...expectedBody,
        name
      };
    }
    if (bio) {
      expectedBody = {
        ...expectedBody,
        bio
      };
    }
    if (dob) {
      const error = validateValues(
        { dob },
        {
          dob: {
            regex: {
              value: dateRegExp,
              message: "Please provide a valid Date of Birth"
            }
          }
        }
      );

      console.log(error);

      if (error) {
        let availableErrors = errors || {};
        errors = {
          ...availableErrors,
          ...error
        };
      }
      expectedBody = {
        ...expectedBody,
        dob
      };
    }

    if (errors) {
      response = {
        ...badRequestResponse,
        error: errors
      };
    } else {
      if (Object.keys(expectedBody).length < 1) {
        response = {
          ...badRequestResponse,
          message: "One of either values must be provided. Name, DOB, Bio"
        };
      } else {
        expectedBody = {
          ...expectedBody,
          updated_at: new Date()
        };
        try {
          const user = await UserSchema.findById(userId);
          if (user) {
            console.log(expectedBody);
            const newDetails = await UserSchema.findByIdAndUpdate(
              userId,
              {
                ...expectedBody
              },
              { new: true }
            );

            console.log(newDetails);

            const userDetails = createUserDetails(newDetails);

            response = {
              ...getResponse,
              message: "Update successful",
              data: userDetails
            };
          } else {
            response = {
              ...unauthorizedResponse
            };
          }
        } catch (error) {}
      }
    }
    res.status(response.status).json(response);
  },
  deleteUserDetailsController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const { userId } = req.body as AUthorizedBody;
    try {
      const user = await UserSchema.findById(userId);

      if (user) {
        const _ = await UserSchema.findByIdAndDelete(userId);
        response = {
          ...processedResponse,
          message: "User already deleted"
        };
      } else {
        response = {
          ...unauthorizedResponse
        };
      }
    } catch (error) {}
    res.status(response.status).json(response);
  },
  updateUserMoodController: ControllerType = (req, res) => {
    res.send("this is to update user mood");
  },
  updateUserLocationController: ControllerType = (req, res) => {
    res.send("this is to update user location");
  },
  updateUserVideoController: ControllerType = (req, res) => {
    res.send("this is to update user video");
  };
