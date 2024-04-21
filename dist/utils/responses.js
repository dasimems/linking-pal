"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServerResponse = exports.tooManyRequestResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.processedResponse = exports.createdResponse = exports.getResponse = exports.badRequestResponse = void 0;
exports.badRequestResponse = {
    status: 400,
    message: "Bad request"
};
exports.getResponse = {
    status: 200,
    message: "Successful"
};
exports.createdResponse = {
    status: 201,
    message: "Created"
};
exports.processedResponse = {
    status: 204,
    message: "Processed"
};
exports.unauthorizedResponse = {
    status: 401,
    message: "Unauthorized"
};
exports.forbiddenResponse = {
    status: 403,
    message: "Forbidden"
};
exports.notFoundResponse = {
    status: 404,
    message: "Not found"
};
exports.tooManyRequestResponse = {
    status: 429,
    message: "Too many request"
};
exports.internalServerResponse = {
    status: 500,
    message: "Internal server"
};
