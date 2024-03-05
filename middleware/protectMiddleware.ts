import { Response, Request, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import userService from "../elements/user/ports/user.service";
import IConnectedRequest from "../globalTypes/IConnectedRequest";
import IUser from "../elements/user/ports/interfaces/IUser";

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
      verify(token, secret);

      const user: IUser = await userService.getByToken(token);

      if (!user) {
        throw new Error("Unauthorized");
      }

      (req as IConnectedRequest<any, any, any, any>).user = user;

      next();
    } catch (_) {
      throw new Error("Unauthorized");
    }
  } else {
    throw new Error("Please provide a token");
  }
};

export default protectMiddleware;
