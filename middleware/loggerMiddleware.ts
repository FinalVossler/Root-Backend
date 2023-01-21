import { NextFunction, Response, Request } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("req body", req.body);
  console.log("req params", req.params);
  console.log("req query", req.query);

  next();
};

export default loggerMiddleware;
