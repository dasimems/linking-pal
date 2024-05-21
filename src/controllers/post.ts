import multer from "multer";
import {
  AuthorDetailsResponseType,
  PostBodyType,
  PostDetailsResponseType
} from ".";
import { postUpload } from "../middleware/multler";
import fs from "fs";
import PostSchema from "../models/PostSchema";
import {
  createAuthorDetails,
  createPostDetails,
  getCloudinaryPublicId,
  getFileRoute,
  validatePost,
  validateUser,
  validateValues
} from "../utils/functions";
import {
  badRequestResponse,
  createdResponse,
  forbiddenResponse,
  getResponse,
  internalServerResponse,
  processedResponse
} from "../utils/responses";
import { ControllerType, PostDetailsType } from "../utils/types";
import cloudinary from "../utils/cloudinary";
import UserSchema from "../models/UserSchema";

export const getPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      try {
        const postList = await PostSchema.find({
          created_by: user.id
        });
        const postAuthors = await Promise.all(
          postList.map((post) => UserSchema.findById(post.created_by))
        );

        const formatedPost = postList
          .map((post) => createPostDetails(post))
          .map((post, index) => ({
            ...post,
            created_by: createAuthorDetails(postAuthors[index]),
            comments: post?.comments.length,
            likes: post?.likes.length,
            is_like_by_user: post?.comments.includes(user?.id)
          }));

        response = {
          ...getResponse,
          data: formatedPost,
          total: postList.length
        };
      } catch (error) {
        console.log(error);
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getNearbyPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const { longitude, latitude } = req.body;

    const user = await validateUser(req, res);

    if (user) {
      try {
        const userLocationDetails = {
          longitude: longitude || user.longitude,
          latitude: latitude || user.latitude
        };
        const postList = await PostSchema.find();
        const postAuthors = await Promise.all(
          postList.map((post) => UserSchema.findById(post.created_by))
        );
        // let postToSend = postList;
        const formatedPost = postList
          .map((post) => createPostDetails(post))
          .map((post, index) => ({
            ...post,
            created_by: createAuthorDetails(postAuthors[index]),
            comments: post?.comments.length,
            likes: post?.likes.length,
            is_like_by_user: post?.comments.includes(user?.id)
          }));

        response = {
          ...getResponse,
          data: formatedPost,
          total: postList.length
        };
      } catch (error) {
        console.log(error);
      }
    } else {
      return;
    }
    res.status(response.status).json(response);
  },
  createPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    const upload = postUpload().array("files");

    if (user) {
      upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          response = {
            ...badRequestResponse,
            message:
              err.message || "Unidentified error occurred while uploading"
          };

          return res.status(response.status).json(response);
        } else if (err) {
          response = {
            ...badRequestResponse,
            message: err?.message || "Unknown error occurred while uploading!"
          };

          return res.status(response.status).json(response);
        }

        const uploadedFiles = req.files as Express.Multer.File[];

        try {
          let errors = null;
          const { text, tags: sentTags } = req.body as PostBodyType;
          let tags = [] as string[];

          if (sentTags) {
            tags = JSON.parse(sentTags as unknown as string) as string[];
          }
          let expectedBody = {
            created_by: user.id,
            created_at: new Date()
          } as PostDetailsType;

          if ((!uploadedFiles || uploadedFiles.length < 1) && !err) {
            if (!errors) {
              errors = {};
            }
            errors = {
              ...errors,
              files: "Please add your post files"
            };
          }

          if (!text || text.length < 1) {
            if (!errors) {
              errors = {};
            }
            errors = {
              ...errors,
              text: "Please provide a text to your post"
            };
          }

          if (text && text.length > 0) {
            expectedBody = {
              ...expectedBody,
              text
            };
          }

          if (
            tags &&
            Array.isArray(tags) &&
            tags.filter(
              (tag) => tag && typeof tag === "string" && tag.length > 0
            ).length > 0
          ) {
            expectedBody = {
              ...expectedBody,
              tags
            };
          }

          if (errors) {
            let response = {
              ...badRequestResponse,
              message: "Please fill in the required fields",
              errors
            };
            return res.status(response.status).json(response);
          }

          if (!errors && uploadedFiles && uploadedFiles.length > 0) {
            const promises = uploadedFiles.map((file) => {
              const { path, originalname } = file;

              const fName = originalname.split(".")[0].split(" ")[0];
              const resource_type = originalname.match(/\.(mp4|MPEG-4|mkv)$/)
                ? "video"
                : "image";
              const userFileName = getFileRoute(
                user.id,
                `${
                  resource_type === "video" ? "video-upload" : "image-upload"
                }/${fName}`
              );

              return cloudinary.uploader.upload(path, {
                resource_type,
                public_id: getCloudinaryPublicId(userFileName, "post")
              });
            });
            const allUploadedFiles = await Promise.all(promises);
            const files = allUploadedFiles.map((file) => file.secure_url);
            uploadedFiles.forEach(({ path }) => {
              if (fs.existsSync(path)) {
                fs.unlinkSync(path);
              }
            });
            expectedBody = {
              ...expectedBody,
              files
            };
            const post = await PostSchema.create(expectedBody);
            if (post) {
              const authorDetails = await UserSchema.findById(post.created_by);
              let data = createPostDetails(post);
              if (authorDetails) {
                data = {
                  ...data,
                  created_by: createAuthorDetails(authorDetails)
                } as PostDetailsResponseType & {
                  created_by: AuthorDetailsResponseType;
                };
              }
              response = {
                ...createdResponse,
                data,
                message: "Post created successfully"
              };

              return res.status(response.status).json(response);
            } else {
              response = {
                ...badRequestResponse,
                message: "Error encountered when creating post"
              };
              return res.status(response.status).json(response);
            }
          }
        } catch (error) {
          uploadedFiles.forEach(({ path }) => {
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          });
          console.log(error);
        }
      });
      return;
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  deleteSinglePostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        if (post.created_by !== user._id) {
          response = {
            ...forbiddenResponse,
            message: "Unknown request"
          };
        }

        if (post.created_by === user._id) {
          try {
            const _ = await PostSchema.findByIdAndDelete(post._id, {
              new: true
            });
            response = {
              ...processedResponse,
              message: "Post deleted successfully"
            };
          } catch (error) {}
        }
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  getSinglePostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        try {
          const postDetails = createPostDetails(post);
          response = {
            ...getResponse,
            data: postDetails
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
  editSinglePostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const { tags: _, ...body } = req.body as PostBodyType;

    const user = await validateUser(req, res);

    const errors = validateValues(body, {
      text: {
        required: {
          value: true,
          message: "Please provide your post description"
        }
      }
    });

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        if (errors) {
          response = {
            ...badRequestResponse,
            message: "Please your description can't be empty",
            error: errors
          };
        }

        if (!errors) {
          const { text } = body;
          if (post.created_by !== user._id) {
            response = {
              ...forbiddenResponse,
              message: "Unknown request"
            };
          }

          if (post.created_by === user._id) {
            try {
              const newPostDetails = await PostSchema.findByIdAndUpdate(
                post._id,
                {
                  text
                },
                { new: true }
              );
              const postDetails = createPostDetails(newPostDetails);
              response = {
                ...getResponse,
                data: postDetails
              };
            } catch (error) {}
          }
        }
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  };
