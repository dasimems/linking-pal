import {
  AUthorizedBody,
  UpdateLocationBody,
  UpdateMoodBody,
  UpdateProfileBody
} from ".";
import UserSchema from "../models/UserSchema";
import { ControllerType, NearbyUserType, ResponseType } from "../utils/types";
import {
  internalServerResponse,
  getResponse,
  forbiddenResponse,
  createdResponse
} from "../utils/responses";
import {
  cacheNearbyUsers,
  calculateAge,
  calculateDistanceBetweenTwoPoints,
  convertMinToSecs,
  createPostDetails,
  createUserDetails,
  fetchCachedNearbyUser,
  getCloudinaryPublicId,
  getFileRoute,
  validateSentUserId,
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
import PostSchema from "../models/PostSchema";
import MatchRequestSchema from "../models/MatchRequestScheme";

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
    const { name, bio, dob, userId, gender } = req.body as UpdateProfileBody;
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

    if (gender) {
      expectedBody = {
        ...expectedBody,
        gender: gender.toLowerCase()
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
          message:
            "One of either values must be provided. Name, DOB, Bio, Gender"
        };
      } else {
        expectedBody = {
          ...expectedBody,
          updated_at: new Date()
        };
        try {
          const user = await validateUser(req, res, true);
          if (user) {
            const newDetails = await UserSchema.findByIdAndUpdate(
              userId,
              {
                ...expectedBody
              },
              { new: true }
            );

            const userDetails = createUserDetails(newDetails);

            response = {
              ...getResponse,
              message: "Update successful",
              data: userDetails
            };
          } else {
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
          message: "User deleted successfully"
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
              const fName = req.file.originalname.split(".")[0].split(" ")[0];
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
                  const deleting = await cloudinary.uploader.destroy(publicId, {
                    resource_type: "video",
                    invalidate: true
                  });
                }
              }
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
            const fName = req.file.originalname.split(".")[0].split(" ")[0];
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
                const deleting = await cloudinary.uploader.destroy(publicId, {
                  resource_type: "image",
                  invalidate: true
                });
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
  },
  getParticularUserDetailsController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const userDetails = await validateSentUserId(req, res);
      if (userDetails) {
        try {
          const postList = await PostSchema.find({
            created_by: userDetails._id
          });
          const post = postList
            .map((post) => ({
              ...createPostDetails(post),
              comments: post.comments.length,
              likes: post.likes.length
            }))
            .reverse();
          const data = {
            ...createUserDetails(userDetails),
            post
          };
          response = {
            ...getResponse,
            data
          };
        } catch (error) {}
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getNearbyUsersController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const query = req.query;

    const user = await validateUser(req, res);
    const { age, mood, distance, interest } =
      query as unknown as NearbyUserType;

    if (user) {
      let maxDistance = distance ?? 10,
        userAge = calculateAge(user.dob),
        femaleExpectancyAge = userAge - 2,
        maleExpectancyAge = userAge + 10,
        maxAge =
          age ?? user.gender === "male"
            ? femaleExpectancyAge < 18
              ? 18
              : femaleExpectancyAge
            : maleExpectancyAge < 18
            ? 18
            : maleExpectancyAge,
        interestedIn = interest ?? "all",
        filteringMood = mood ?? user.mood[0];
      const userList = (await UserSchema.find())
        .filter(
          (userDetails) =>
            JSON.stringify(userDetails._id) !== JSON.stringify(user._id)
        )
        .filter((userDetails) => calculateAge(userDetails.dob) <= maxAge) //filtering using max age
        .filter(
          (userDetails) =>
            userDetails.mood &&
            userDetails.mood
              .map((mood) => mood.toLowerCase())
              .includes(filteringMood.toLowerCase())
        ) //filtering using mood
        .filter((userDetails) =>
          interestedIn === "all"
            ? userDetails.gender
            : userDetails.gender === interestedIn
        ) //filtering using gender
        .filter(
          (userDetails) =>
            calculateDistanceBetweenTwoPoints(
              {
                latitude: userDetails.latitude.toString(),
                longitude: userDetails.longitude.toString()
              },
              {
                latitude: user.latitude.toString(),
                longitude: user.longitude.toString()
              }
            ) <= parseFloat(maxDistance)
        ); //filtering by distance
      const cachedUser = fetchCachedNearbyUser(user._id as unknown as string);

      if (!user.has_subscribed) {
        if (cachedUser) {
          response = {
            ...getResponse,
            data: cachedUser.map((data) => createUserDetails(data)),
            message: "Please subscribe to view more than 10 users per day"
          };
        } else {
          const slicedData = userList.slice(0, 10);
          const data = slicedData.map((data) => createUserDetails(data));
          // if (slicedData.length > 9) {
          //   cacheNearbyUsers(slicedData, user._id as unknown as string);
          // }
          response = {
            ...getResponse,
            data,
            message: "Please subscribe to view more than 10 users per day"
          };
        }
      }

      if (user.has_subscribed) {
        response = {
          ...getResponse,
          data: userList.map((data) => createUserDetails(data))
        };
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getMatchesController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      try {
        const matches = await MatchRequestSchema.find({
          $or: [{ receiver_id: user._id }, { sender_id: user._id }],
          is_accepted: true
        });
        const data = (
          await Promise.all(
            matches.map((match) => UserSchema.findById(match.sender_id))
          )
        ).map((user, index) => ({
          ...createUserDetails(user),
          accepted_on: matches[index].accepted_at
        }));

        response = {
          ...getResponse,
          data
        };
      } catch (error) {}
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getMatchRequestController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const matches = await MatchRequestSchema.find({
        receiver_id: user._id,
        is_accepted: false
      });
      const data = (
        await Promise.all(
          matches.map((match) => UserSchema.findById(match.sender_id))
        )
      ).map((user, index) => ({
        ...createUserDetails(user),
        created_at: matches[index]?.created_at ?? null
      }));

      response = {
        ...getResponse,
        data
      };
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  sendMatchRequestController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const sender = await validateUser(req, res);

    if (sender) {
      const receiverDetails = await validateSentUserId(req, res);

      if (receiverDetails) {
        if (
          JSON.stringify(receiverDetails._id) === JSON.stringify(sender._id)
        ) {
          response = {
            ...badRequestResponse,
            message: "Sorry you can't sent a request to yourself"
          };
        }
        if (
          JSON.stringify(receiverDetails._id) !== JSON.stringify(sender._id)
        ) {
          const hasSentRequest = await MatchRequestSchema.find({
            $and: [
              {
                $or: [
                  {
                    receiver_id: receiverDetails._id,
                    sender_id: sender._id
                  },
                  {
                    sender_id: receiverDetails._id,
                    receiver_id: sender._id
                  }
                ]
              },
              { $or: [{ is_accepted: true }, { is_accepted: false }] }
            ]
          });

          if (hasSentRequest.length > 0) {
            const request = hasSentRequest[0];
            response = {
              ...badRequestResponse,
              message:
                JSON.stringify(request.sender_id) === JSON.stringify(sender._id)
                  ? `You already sent ${receiverDetails.name} a request`
                  : ` ${receiverDetails.name} already sent you a request`
            };
          }

          if (hasSentRequest.length < 1) {
            const match = await MatchRequestSchema.create({
              receiver_id: receiverDetails.id,
              sender_id: sender._id
            });

            if (match) {
              response = {
                ...createdResponse,
                message: `Match request sent to ${receiverDetails.name} sucessfully`
              };
            }
          }
        }
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  acceptMatchRequestController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const senderDetails = await validateSentUserId(req, res);

      if (senderDetails) {
        const matchRequestDetails = await MatchRequestSchema.find({
          receiver_id: user.id,
          sender_id: senderDetails.id
        });

        if (matchRequestDetails.length > 0) {
          const [matchRequest] = matchRequestDetails;
          if (matchRequest.is_accepted) {
            response = {
              ...badRequestResponse,
              message: "Already accepted"
            };
          }

          if (!matchRequest.is_accepted) {
            const updatedMatchRequest =
              await MatchRequestSchema.findByIdAndUpdate(
                matchRequest._id,
                {
                  is_accepted: true,
                  accepted_at: new Date()
                },
                {
                  new: true
                }
              );

            if (updatedMatchRequest) {
              response = {
                ...processedResponse
              };
            }
          }
        }

        if (matchRequestDetails.length < 1) {
          response = {
            ...badRequestResponse,
            message: "Can't find match request"
          };
        }
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  };
