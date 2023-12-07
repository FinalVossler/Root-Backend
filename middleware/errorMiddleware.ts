import { NextFunction, Request, Response } from "express";

const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("error", JSON.stringify(error));
  if (error != null) {
    return res
      .status(500)
      .json({
        success: false,
        error: {
          message: error.message,
          ...error,
        },
      })
      .send();
  } else {
    next();
  }
};

export default errorMiddleware;
