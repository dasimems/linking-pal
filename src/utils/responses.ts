import { ResponseType } from "./types";

export const badRequestResponse: ResponseType = {
  status: 400,
  message: "Bad request"
};
export const conflictResponse: ResponseType = {
  status: 409,
  message: "Conflict"
};
export const getResponse: ResponseType = {
  status: 200,
  message: "Successful"
};
export const createdResponse: ResponseType = {
  status: 201,
  message: "Created"
};
export const processedResponse: ResponseType = {
  status: 204,
  message: "Processed"
};

export const unauthorizedResponse: ResponseType = {
  status: 401,
  message: "Unauthorized"
};

export const forbiddenResponse: ResponseType = {
  status: 403,
  message: "Forbidden"
};
export const notFoundResponse: ResponseType = {
  status: 404,
  message: "Not found"
};
export const tooManyRequestResponse: ResponseType = {
  status: 429,
  message: "Too many request"
};
export const internalServerResponse: ResponseType = {
  status: 500,
  message: "Internal server error"
};
