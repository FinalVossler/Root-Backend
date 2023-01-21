"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var errorMiddleware = function (error, req, res, next) {
    if (error != null) {
        return res
            .status(500)
            .json({
            success: false,
            error: __assign({ message: error.message }, error)
        })
            .send();
    }
    else {
        next();
    }
};
exports["default"] = errorMiddleware;
