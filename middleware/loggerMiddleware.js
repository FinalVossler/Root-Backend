"use strict";
exports.__esModule = true;
var loggerMiddleware = function (req, res, next) {
    console.log("req body", req.body);
    console.log("req params", req.params);
    console.log("req query", req.query);
    next();
};
exports["default"] = loggerMiddleware;
