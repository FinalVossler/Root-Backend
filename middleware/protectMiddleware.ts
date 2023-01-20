import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../elements/user/user.model";
import userService from "../elements/user/user.service";
import ConnectedRequest from "../globalTypes/ConnectedRequest";

const protectMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    throw new Error("Unauthorized");
  }

  const tokenWithBearer: string = req.headers.authorization;

  if (tokenWithBearer) {
    const token: string = tokenWithBearer.split(" ")[1];

    // @ts-ignore
    const secret: string = process.env.JWT_SECRET;

    try {
      jwt.verify(token, secret);

      const user: IUser = await userService.getByToken(token);

      if (!user) {
        throw new Error("Unauthorized");
      }

      (req as ConnectedRequest).user = user;

      next();
    } catch (_) {
      throw new Error("Unauthorized");
    }
  } else {
    throw new Error("Please provde a token");
  }
};

export default protectMiddleware;
