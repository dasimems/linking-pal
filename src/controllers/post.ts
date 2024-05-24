import multer from "multer";
import {
  AuthorDetailsResponseType,
  CommentDetailsResponseType,
  LikeDetailsResponseType,
  PostBodyType,
  PostDetailsResponseType
} from ".";
import { postUpload } from "../middleware/multler";
import fs from "fs";
import PostSchema from "../models/PostSchema";
import {
  createAuthorDetails,
  createCommentDetails,
  createLikeDetails,
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
import {
  CommentDetailsType,
  ControllerType,
  PostDetailsType
} from "../utils/types";
import cloudinary from "../utils/cloudinary";
import UserSchema from "../models/UserSchema";
import CommentSchema from "../models/CommentSchema";
import LikeSchema from "../models/LikesSchema";
import { createPostDetails } from "../utils/functions";

export const getPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      try {
        const postList = await PostSchema.find({
          created_by: user._id
        });
        const postAuthorsPromise = Promise.all(
          postList.map((post) => UserSchema.findById(post.created_by))
        );

        const postLikesPromise = Promise.all(
          postList.map((post) =>
            Promise.all(post.likes.map((like) => LikeSchema.findById(like)))
          )
        );

        const [postAuthors, postLikes] = await Promise.all([
          postAuthorsPromise,
          postLikesPromise
        ]);
        const postLikesAvailable = postLikes.map((posts) =>
          posts.find(
            (post) =>
              post &&
              JSON.stringify(post.created_by) === JSON.stringify(user._id)
          )
            ? true
            : false
        );

        const formatedPost = postList
          .map((post) => createPostDetails(post))
          .map((post, index) => ({
            ...post,
            created_by: createAuthorDetails(postAuthors[index]),
            comments: post?.comments.length,
            likes: post?.likes.length,
            is_like_by_user: postLikesAvailable[index]
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
        const postAuthorsPromise = Promise.all(
          postList.map((post) => UserSchema.findById(post.created_by))
        );

        const postLikesPromise = Promise.all(
          postList.map((post) =>
            Promise.all(post.likes.map((like) => LikeSchema.findById(like)))
          )
        );

        const [postAuthors, postLikes] = await Promise.all([
          postAuthorsPromise,
          postLikesPromise
        ]);
        const postLikesAvailable = postLikes.map((posts) =>
          posts.find(
            (post) =>
              post &&
              JSON.stringify(post.created_by) === JSON.stringify(user._id)
          )
            ? true
            : false
        );
        // let postToSend = postList;
        const formatedPost = postList
          .map((post) => createPostDetails(post))
          .map((post, index) => ({
            ...post,
            created_by: createAuthorDetails(postAuthors[index]),
            comments: post?.comments.length,
            likes: post?.likes.length,
            is_like_by_user: postLikesAvailable[index]
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
        const createdBy = JSON.stringify(post.created_by);
        const userId = JSON.stringify(user._id);
        if (createdBy !== userId) {
          response = {
            ...forbiddenResponse,
            message: "Unknown request"
          };
        }

        if (createdBy === userId) {
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
          const authorPromise = UserSchema.findById(post.created_by);
          const commentPromise = Promise.all(
            post.comments.map((id) => CommentSchema.findById(id))
          );
          const likePromise = Promise.all(
            post.likes.map((id) => LikeSchema.findById(id))
          );
          const [authorDetails, commentDetails, likeDetails] =
            await Promise.all([authorPromise, commentPromise, likePromise]);
          const isLikeAvailable = likeDetails.find(
            (like) =>
              JSON.stringify(like?.created_by) === JSON.stringify(user._id)
          );
          const commentAuthorsPromise = Promise.all(
            commentDetails.map((comment) =>
              comment?.created_by
                ? UserSchema.findById(comment?.created_by)
                : undefined
            )
          );
          const likeAuthorsPromise = Promise.all(
            likeDetails.map((like) =>
              like?.created_by
                ? UserSchema.findById(like?.created_by)
                : undefined
            )
          );

          const [commentAuthors, likeAuthors] = await Promise.all([
            commentAuthorsPromise,
            likeAuthorsPromise
          ]);
          let data = createPostDetails(post);
          if (authorDetails) {
            data = {
              ...data,
              created_by: createAuthorDetails(authorDetails),
              likes: likeDetails.map((like, index) => ({
                ...createLikeDetails(like),
                created_by: createAuthorDetails(likeAuthors[index] || null)
              })),
              comments: commentDetails.map((comment, index) => ({
                ...createCommentDetails(comment),
                created_by: createAuthorDetails(commentAuthors[index] || null),
                replies: comment?.replies?.length,
                likes: comment?.likes?.length
              })),
              is_like_by_user: isLikeAvailable ? true : false
            } as unknown as PostDetailsResponseType & {
              created_by: AuthorDetailsResponseType;
              likes: LikeDetailsResponseType &
                { created_by: AuthorDetailsResponseType }[];
              comment: CommentDetailsResponseType &
                { created_by: AuthorDetailsResponseType }[];
            };
          }
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
          message: "Please provide description to update"
        }
      }
    });

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        if (errors) {
          response = {
            ...badRequestResponse,
            message: "Please provide description to update",
            error: errors
          };
        }

        if (!errors) {
          const { text } = body;
          const createdBy = JSON.stringify(post.created_by);
          const userId = JSON.stringify(user._id);

          if (createdBy !== userId) {
            response = {
              ...forbiddenResponse,
              message: "Unknown request"
            };
          }

          if (createdBy === userId) {
            try {
              const availableLikesPromise = Promise.all(
                post.likes.map((id) => LikeSchema.findById(id))
              );

              const newPostPromise = PostSchema.findByIdAndUpdate(
                post._id,
                {
                  text,
                  updated_at: new Date()
                },
                { new: true }
              );

              const [newPostDetails, availableLikes] = await Promise.all([
                newPostPromise,
                availableLikesPromise
              ]);

              const isLikeAvailable = availableLikes.find(
                (like) =>
                  JSON.stringify(like?.created_by) === JSON.stringify(user._id)
              );
              const postDetails = createPostDetails(newPostDetails);
              response = {
                ...getResponse,
                data: {
                  ...postDetails,
                  comments: postDetails?.comments?.length,
                  likes: postDetails?.likes?.length,
                  is_like_by_user: isLikeAvailable ? true : false
                }
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
  },
  likeAPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        const likeBody = {
          post_id: post._id,
          created_at: new Date(),
          created_by: user._id
        };
        try {
          const availableLikes = await Promise.all(
            post.likes.map((id) => LikeSchema.findById(id))
          );

          const isLikeAvailable = availableLikes.find(
            (like) =>
              JSON.stringify(like?.created_by) === JSON.stringify(user._id)
          );

          if (isLikeAvailable) {
            response = {
              ...badRequestResponse,
              message: "You already liked this post"
            };
          } else {
            const likeDetails = await LikeSchema.create(likeBody);
            const newPostDetails = await PostSchema.findByIdAndUpdate(
              post._id,
              {
                likes: [...post.likes, likeDetails._id]
              },
              {
                new: true
              }
            );
            const data = {
              ...createPostDetails(newPostDetails),
              likes: newPostDetails?.likes.length,
              comments: newPostDetails?.comments.length,
              is_like_by_user: true
            };

            response = {
              ...getResponse,
              data
            };
          }
        } catch (error) {}
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  dislikeAPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        const likeBody = {
          post_id: post._id,
          created_at: new Date(),
          created_by: user._id
        };
        try {
          const availableLikes = await Promise.all(
            post.likes.map((id) => LikeSchema.findById(id))
          );

          const isLikeAvailable = availableLikes.find(
            (like) =>
              JSON.stringify(like?.created_by) === JSON.stringify(user._id)
          );

          if (isLikeAvailable) {
            const likePromise = LikeSchema.findByIdAndDelete(
              isLikeAvailable._id
            );
            const newPostPromise = PostSchema.findByIdAndUpdate(
              post._id,
              {
                likes: post.likes.filter(
                  (like) =>
                    JSON.stringify(isLikeAvailable._id) !== JSON.stringify(like)
                )
              },
              {
                new: true
              }
            );
            const [newPostDetails] = await Promise.all([
              newPostPromise,
              likePromise
            ]);
            const data = {
              ...createPostDetails(newPostDetails),
              likes: newPostDetails?.likes.length,
              comments: newPostDetails?.comments.length,
              is_like_by_user: false
            };

            response = {
              ...getResponse,
              data
            };
          } else {
            response = {
              ...badRequestResponse,
              message: "You haven't like this post"
            };
          }
        } catch (error) {}
      } else {
        return;
      }
    } else {
      return;
    }

    res.status(response.status).json(response);
  },
  createCommentController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };
    const user = await validateUser(req, res);

    if (user) {
      const post = await validatePost(req, res);

      if (post) {
        const body = req.body;

        const error = validateValues(body, {
          comment: {
            required: true,
            message: "Please provide your comment"
          }
        });

        if (error) {
          response = {
            ...badRequestResponse,
            message: "Please provide your comment",
            error
          };
        }

        if (!error) {
          try {
            const { comment } = req.body;
            const commentBodyType: Omit<
              CommentDetailsType,
              "updated_at" | "likes" | "replies"
            > = {
              comment,
              created_at: new Date(),
              created_by: user._id,
              post_id: post._id
            };
            const commentDetails = await CommentSchema.create(commentBodyType);
            if (commentDetails) {
              const newPost = await PostSchema.findByIdAndUpdate(
                post._id,
                {
                  comments: [...post.comments, commentDetails._id]
                },
                {
                  new: true
                }
              );
              const data = {
                ...createPostDetails(newPost),
                likes: newPost?.likes?.length,
                comments: newPost?.comments?.length
              };

              response = {
                ...getResponse,
                data
              };
            }
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
  getCommentController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    res.status(response.status).json(response);
  };
