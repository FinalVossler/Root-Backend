import { NextFunction, Response, Request } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // console.info("req body", req.body);
  // console.info("req params", req.params);
  // console.info("req query", req.query);

  next();
};

export default loggerMiddleware;
