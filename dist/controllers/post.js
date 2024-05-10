"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSinglePostController = exports.getSinglePostController = exports.deleteSinglePostController = exports.createPostController = exports.getNearbyPostController = exports.getPostController = void 0;
const PostSchema_1 = __importDefault(require("../models/PostSchema"));
const functions_1 = require("../utils/functions");
const responses_1 = require("../utils/responses");
const getPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const user = yield (0, functions_1.validateUser)(req, res);
    if (user) {
        try {
            const postList = yield PostSchema_1.default.find({
                _id: user.id
            });
            response = Object.assign(Object.assign({}, responses_1.getResponse), { data: postList, total: postList.length });
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        return;
    }
    res.status(response.status).json(response);
}), getNearbyPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () { }), createPostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const user = yield (0, functions_1.validateUser)(req, res);
    const { text, tags } = req.body;
    if (user) {
        let expectedBody = {
            created_by: user.id
        };
        if (text && text.length > 0) {
            expectedBody = Object.assign(Object.assign({}, expectedBody), { text });
        }
        if (tags && Array.isArray(tags) && tags.length > 0) {
            expectedBody = Object.assign(Object.assign({}, expectedBody), { tags });
        }
    }
    else {
        return;
    }
    res.status(response.status).json(response);
}), deleteSinglePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const user = yield (0, functions_1.validateUser)(req, res);
    if (user) {
        const post = yield (0, functions_1.validatePost)(req, res);
        if (post) {
            if (post.created_by !== user._id) {
                response = Object.assign(Object.assign({}, responses_1.forbiddenResponse), { message: "Unknown request" });
            }
            if (post.created_by === user._id) {
                try {
                    const _ = yield PostSchema_1.default.findByIdAndDelete(post._id, {
                        new: true
                    });
                    response = Object.assign(Object.assign({}, responses_1.processedResponse), { message: "Post deleted successfully" });
                }
                catch (error) { }
            }
        }
        else {
            return;
        }
    }
    else {
        return;
    }
    res.status(response.status).json(response);
}), getSinglePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const user = yield (0, functions_1.validateUser)(req, res);
    if (user) {
        const post = yield (0, functions_1.validatePost)(req, res);
        if (post) {
            try {
                const postDetails = (0, functions_1.createPostDetails)(post);
                response = Object.assign(Object.assign({}, responses_1.getResponse), { data: postDetails });
            }
            catch (error) { }
        }
        else {
            return;
        }
    }
    else {
        return;
    }
    res.status(response.status).json(response);
}), editSinglePostController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response = Object.assign({}, responses_1.internalServerResponse);
    const _a = req.body, { tags: _ } = _a, body = __rest(_a, ["tags"]);
    const user = yield (0, functions_1.validateUser)(req, res);
    const errors = (0, functions_1.validateValues)(body, {
        text: {
            required: {
                value: true,
                message: "Please provide your post description"
            }
        }
    });
    if (user) {
        const post = yield (0, functions_1.validatePost)(req, res);
        if (post) {
            if (errors) {
                response = Object.assign(Object.assign({}, responses_1.badRequestResponse), { message: "Please your description can't be empty", error: errors });
            }
            if (!errors) {
                const { text } = body;
                if (post.created_by !== user._id) {
                    response = Object.assign(Object.assign({}, responses_1.forbiddenResponse), { message: "Unknown request" });
                }
                if (post.created_by === user._id) {
                    try {
                        const newPostDetails = yield PostSchema_1.default.findByIdAndUpdate(post._id, {
                            text
                        }, { new: true });
                        const postDetails = (0, functions_1.createPostDetails)(newPostDetails);
                        response = Object.assign(Object.assign({}, responses_1.getResponse), { data: postDetails });
                    }
                    catch (error) { }
                }
            }
        }
        else {
            return;
        }
    }
    else {
        return;
    }
    res.status(response.status).json(response);
});
exports.getPostController = getPostController, exports.getNearbyPostController = getNearbyPostController, exports.createPostController = createPostController, exports.deleteSinglePostController = deleteSinglePostController, exports.getSinglePostController = getSinglePostController, exports.editSinglePostController = editSinglePostController;
