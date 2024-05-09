import {
  AUthorizedBody,
  UpdateLocationBody,
  UpdateMoodBody,
  UpdateProfileBody
} from ".";
import UserSchema from "../models/UserSchema";
import { ControllerType, ResponseType } from "../utils/types";
import {
  internalServerResponse,
  getResponse,
  forbiddenResponse
} from "../utils/responses";
import {
  convertMinToSecs,
  createUserDetails,
  getCloudinaryPublicId,
  getFileRoute,
  validateUser,
  validateValues
} from "../utils/functions";
import fs from "fs";
import { coordinateRegExp, dateRegExp } from "../utils/regex";
import { badRequestResponse, processedResponse } from "../utils/responses";
import { cloudinaryFolderName, hour24Milliseconds } from "../utils/_variables";
import { imageUpload, videUpload } from "../middleware/multler";
import multer from "multer";
import getVideoDurationInSeconds from "get-video-duration";
import cloudinary from "../utils/cloudinary";

export const getUserDetailsController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    try {
      const user = await validateUser(req, res, true);
      if (user) {
        const data = createUserDetails(user);

        response = {
          ...getResponse,
          data
        };
      } else {
        return;
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
          const user = await validateUser(req, res, true);
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

            return;
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
      const user = await validateUser(req, res);

      if (user) {
        const _ = await UserSchema.findByIdAndDelete(userId);
        response = {
          ...processedResponse,
          message: "User already deleted"
        };
      } else {
        return;
      }
    } catch (error) {}
    res.status(response.status).json(response);
  },
  updateUserMoodController: ControllerType = async (req, res) => {
    const body = req.body as UpdateMoodBody;
    const { mood } = body;
    const user = await validateUser(req, res);
    let response: ResponseType = {
      ...internalServerResponse
    };

    if (!mood || !Array.isArray(mood)) {
      response = {
        ...badRequestResponse,
        message: mood
          ? "Invalid mood type detected! Mood must be an array"
          : "Please provide your mood"
      };
    } else {
      if (user) {
        let errors = null;

        if (mood.length < 1) {
          if (!errors) {
            errors = {};
          }
          errors = {
            ...errors,
            mood: "Please provide at least one mood"
          };
        }

        if (mood.length > 1 && !user.has_subscribed) {
          if (!errors) {
            errors = {};
          }
          errors = {
            ...errors,
            mood: "You can't select add than one mood. Please subscribe to add more than one mood"
          };
        }

        if (errors) {
          response = {
            ...badRequestResponse,
            error: errors
          };
        }

        if (!errors) {
          const lastUpdated = new Date(
            user.mood_last_updated || Date.now()
          ).getTime();
          const presentDate = new Date().getTime();
          if (
            user.mood_last_updated &&
            !user.has_subscribed &&
            presentDate - lastUpdated < hour24Milliseconds
          ) {
            response = {
              ...forbiddenResponse,
              message:
                "You can only update your mood once in 24 hours. Subscribe to remove the restriction"
            };
          }
          if (
            !user.mood_last_updated ||
            user.has_subscribed ||
            (user.mood_last_updated &&
              !user.has_subscribed &&
              presentDate - lastUpdated >= hour24Milliseconds)
          ) {
            try {
              const newDetails = await UserSchema.findByIdAndUpdate(
                user.id,
                {
                  mood,
                  mood_last_updated: new Date()
                },
                { new: true }
              );

              const userDetails = createUserDetails(newDetails);

              response = {
                ...getResponse,
                message: "Mood updated successful",
                data: userDetails
              };
            } catch (error) {}
          }
        }
      } else {
        return;
      }
    }

    res.status(response.status).json(response);
  },
  updateUserLocationController: ControllerType = async (req, res) => {
    const body = req.body as UpdateLocationBody;
    const { latitude, longitude } = body;
    const user = await validateUser(req, res);
    let response: ResponseType = {
      ...internalServerResponse
    };

    const errors = validateValues(body, {
      latitude: {
        required: {
          value: true,
          message: "Please provide your latitude"
        },
        regex: {
          value: coordinateRegExp,
          message: "Please input a valid latitude"
        }
      },
      longitude: {
        required: {
          value: true,
          message: "Please provide your longitude"
        },
        regex: {
          value: coordinateRegExp,
          message: "Please input a valid longitude"
        }
      }
    });

    if (errors) {
      response = {
        ...badRequestResponse,
        error: errors
      };
    }

    if (!errors) {
      if (user) {
        try {
          const _ = await UserSchema.findByIdAndUpdate(
            user.id,
            {
              longitude,
              latitude
            },
            { new: true }
          );

          response = {
            ...getResponse,
            message: "Location updated successful"
          };
        } catch (error) {}
      } else {
        return;
      }
    }
    res.status(response.status).json(response);
  },
  updateUserVideoController: ControllerType = async (req, res) => {
    const user = await validateUser(req, res);
    let response: ResponseType = {
      ...internalServerResponse
    };
    const upload = videUpload().single("video");
    if (user) {
      upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          response = {
            ...badRequestResponse,
            message:
              err.message || "Unidentified error occurred while uploading"
          };
          res.status(response.status).json(response);
          return;
        } else if (err) {
          response = {
            ...badRequestResponse,
            message: err?.message || "Unknown error occurred while uploading!"
          };
          res.status(response.status).json(response);
          return;
        }

        if (!req.file && !err) {
          response = {
            ...badRequestResponse,
            message: "Please upload a video"
          };

          return res.status(response.status).json(response);
        }

        if (!err && req.file) {
          const { path } = req.file;
          console.log("path", path);
          try {
            const duration = await getVideoDurationInSeconds(path);

            if (duration > convertMinToSecs(1.5)) {
              response = {
                ...badRequestResponse,
                message: "Please upload video not more than 90 secs"
              };

              fs.unlinkSync(path);
              res.status(response.status).json(response);
              return;
            } else {
              const fName = req.file.originalname.split(".")[0];
              const userFileName = getFileRoute(user.id, fName);
              if (user.video) {
                const splittedUserVideo = user.video.split("/");
                const videoFileName =
                  splittedUserVideo[splittedUserVideo.length - 1];

                const saveFileRoute = getFileRoute(user.id, videoFileName);
                const publicId = getCloudinaryPublicId(
                  saveFileRoute,
                  "video"
                ).split(".")[0];

                if (publicId) {
                  console.log("previousId", publicId);
                  const deleting = await cloudinary.uploader.destroy(publicId, {
                    resource_type: "video",
                    invalidate: true
                  });
                  console.log(deleting);
                }
              }
              console.log("fileName", userFileName);
              cloudinary.uploader.upload(
                path,
                {
                  resource_type: "video",
                  public_id: getCloudinaryPublicId(userFileName, "video")
                },
                async (err, video) => {
                  fs.unlinkSync(path);
                  if (err) {
                    response = {
                      ...internalServerResponse,
                      message: err?.message
                    };
                    return res.status(response.status).json(response);
                  }

                  if (!err) {
                    console.log(video);
                    const newDetails = await UserSchema.findByIdAndUpdate(
                      user.id,
                      {
                        video: video?.secure_url,
                        updated_at: new Date()
                      },
                      { new: true }
                    );
                    const userDetails = createUserDetails(newDetails);

                    response = {
                      ...getResponse,
                      message: "Video Updated successfully",
                      data: userDetails
                    };

                    return res.status(response.status).json(response);
                  }
                }
              );
            }
            return;
          } catch (error) {
            response.message =
              "Internal server error! Unable to determine video duration";
            res.status(response.status).json(response);
            return;
          }
        }
      });
    } else {
      return;
    }

    // res.status(response.status).json(response);
  },
  updateUserAvatarController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const user = await validateUser(req, res);
    const upload = imageUpload().single("avatar");

    if (user) {
      upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          response = {
            ...badRequestResponse,
            message:
              err.message || "Unidentified error occurred while uploading"
          };
          res.status(response.status).json(response);
          return;
        } else if (err) {
          response = {
            ...badRequestResponse,
            message: err?.message || "Unknown error occurred while uploading!"
          };
          res.status(response.status).json(response);
          return;
        }

        if (!req.file && !err) {
          response = {
            ...badRequestResponse,
            message: "Please upload an image"
          };

          return res.status(response.status).json(response);
        }

        if (!err && req.file) {
          const { path } = req.file;
          try {
            const fName = req.file.originalname.split(".")[0];
            const userFileName = getFileRoute(user.id, fName);

            if (user.avatar) {
              const splittedUserVideo = user.avatar.split("/");
              const imageFileName =
                splittedUserVideo[splittedUserVideo.length - 1];

              const saveFileRoute = getFileRoute(user.id, imageFileName);
              const publicId = getCloudinaryPublicId(
                saveFileRoute,
                "image"
              ).split(".")[0];

              if (publicId) {
                console.log("previousId", publicId);
                const deleting = await cloudinary.uploader.destroy(publicId, {
                  resource_type: "image",
                  invalidate: true
                });
                console.log(deleting);
              }
            }

            cloudinary.uploader.upload(
              path,
              {
                resource_type: "image",
                public_id: getCloudinaryPublicId(userFileName, "image")
              },
              async (err, image) => {
                fs.unlinkSync(path);
                if (err) {
                  response = {
                    ...internalServerResponse,
                    message: err?.message
                  };
                  return res.status(response.status).json(response);
                }

                if (!err) {
                  console.log(image);
                  const newDetails = await UserSchema.findByIdAndUpdate(
                    user.id,
                    {
                      avatar: image?.secure_url,
                      updated_at: new Date()
                    },
                    { new: true }
                  );
                  const userDetails = createUserDetails(newDetails);

                  response = {
                    ...getResponse,
                    message: "Profile picture updated successfully",
                    data: userDetails
                  };

                  return res.status(response.status).json(response);
                }
              }
            );

            return;
          } catch (error) {
            response.message = "Internal server error! Unable to upload image";
            res.status(response.status).json(response);
            return;
          }
        }
      });
    } else {
      return;
    }
  };
