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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPToken = exports.verifyUserToken = void 0;
const functions_1 = require("../utils/functions");
const verifyUserToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let sentToken = req.headers.authorization;
    const tokenError = {
        message: "Unauthorized",
        status: 401
    };
    if (sentToken) {
        sentToken = sentToken.replace("Bearer", "").trim();
        try {
            const decodedToken = (yield (0, functions_1.reverseToken)(sentToken));
            const userId = (decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.userId) || "";
            if (userId) {
                req.body.userId = userId;
                next();
            }
            else {
                return res.status(tokenError.status).json(tokenError);
            }
        }
        catch (error) {
            return res.status(tokenError.status).json(tokenError);
        }
    }
    else {
        return res.status(tokenError.status).json(tokenError);
    }
});
exports.verifyUserToken = verifyUserToken;
const verifyOTPToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let sentToken = req.headers.authorization;
    const tokenError = {
        message: "Unauthorized",
        status: 401
    };
    if (sentToken) {
        sentToken = sentToken.replace("Bearer", "").trim();
        try {
            const decodedToken = (yield (0, functions_1.reverseToken)(sentToken));
            req.body.userId = (decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.userId) || "";
            req.body.verificationType = (decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.verificationType) || "";
            next();
        }
        catch (error) {
            return res.status(tokenError.status).json(tokenError);
        }
    }
    else {
        return res.status(tokenError.status).json(tokenError);
    }
});
exports.verifyOTPToken = verifyOTPToken;
