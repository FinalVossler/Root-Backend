"use strict";
exports.__esModule = true;
exports.toReadDto = void 0;
var toReadDto = function (user) {
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    };
};
exports.toReadDto = toReadDto;
