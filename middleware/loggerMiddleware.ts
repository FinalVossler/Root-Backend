import { NextFunction, Response, Request } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("req body", req.body);
  console.log("req params", req.params);
  console.log("req query", req.query);
  //@ts-ignore
  console.log("mongo url", process.env.MONGO_URI);

  next();
};

export default loggerMiddleware;
