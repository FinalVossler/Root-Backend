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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var jsonwebtoken_1 = require("jsonwebtoken");
var bcrypt_1 = require("bcrypt");
var user_repository_1 = require("./user.repository");
var userService = {
    get: function (currentUserId) { return __awaiter(void 0, void 0, void 0, function () {
        var users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_repository_1["default"].get(currentUserId)];
                case 1:
                    users = _a.sent();
                    return [2 /*return*/, users];
            }
        });
    }); },
    register: function (command) { return __awaiter(void 0, void 0, void 0, function () {
        var user, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_repository_1["default"].save(command)];
                case 1:
                    user = _a.sent();
                    token = userService.generateToken(user);
                    return [2 /*return*/, { token: token, user: user }];
            }
        });
    }); },
    login: function (command) { return __awaiter(void 0, void 0, void 0, function () {
        var user, validPassword, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_repository_1["default"].getByEmail(command.email)];
                case 1:
                    user = _a.sent();
                    if (user === null) {
                        throw new Error("User not found");
                    }
                    return [4 /*yield*/, bcrypt_1["default"].compare(command.password, user.password)];
                case 2:
                    validPassword = _a.sent();
                    if (!validPassword) {
                        throw new Error("Invalid password");
                    }
                    token = userService.generateToken(user);
                    return [2 /*return*/, { token: token, user: user }];
            }
        });
    }); },
    update: function (command) { return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, user_repository_1["default"].update(command)];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, user];
            }
        });
    }); },
    getByToken: function (token) { return __awaiter(void 0, void 0, void 0, function () {
        var signedUser, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    signedUser = jsonwebtoken_1["default"].decode(token);
                    return [4 /*yield*/, user_repository_1["default"].getbyId(signedUser._id)];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, user];
            }
        });
    }); },
    generateToken: function (user) {
        var toSign = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        // @ts-ignore
        var secret = process.env.JWT_SECRET;
        var token = jsonwebtoken_1["default"].sign(
        // @ts-ignore
        toSign, secret, {
            // @ts-ignore
            expiresIn: process.env.TOKEN_EXPIRES_IN
        });
        return token;
    }
};
exports["default"] = userService;
