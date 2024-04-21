"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRegExp = exports.passwordRegExp = exports.emailRegExp = exports.numberRegExp = exports.phoneNumberRegExp = void 0;
exports.phoneNumberRegExp = /^\+?[0-9]+\s?[0-9\s.()-]{8,}$/, exports.numberRegExp = /^[0-9]+$/, exports.emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, exports.passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,}$/, exports.dateRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
