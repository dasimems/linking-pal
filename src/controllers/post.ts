import { PostBodyType } from ".";
import PostSchema from "../models/PostSchema";
import {
  createPostDetails,
  validatePost,
  validateUser,
  validateValues
} from "../utils/functions";
import {
  badRequestResponse,
  forbiddenResponse,
  getResponse,
  internalServerResponse,
  processedResponse
} from "../utils/responses";
import { ControllerType, PostDetailsType } from "../utils/types";

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

        const formatedPost = postList.map((post) => createPostDetails(post));

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
  getNearbyPostController: ControllerType = async (req, res) => {},
  createPostController: ControllerType = async (req, res) => {
    let response = {
      ...internalServerResponse
    };

    const user = await validateUser(req, res);
    const { text, tags } = req.body as PostBodyType;

    if (user) {
      let expectedBody = {
        created_by: user.id
      } as PostDetailsType;
      if (text && text.length > 0) {
        expectedBody = {
          ...expectedBody,
          text
        };
      }

      if (tags && Array.isArray(tags) && tags.length > 0) {
        expectedBody = {
          ...expectedBody,
          tags
        };
      }
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
