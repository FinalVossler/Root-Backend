import { Response, NextFunction } from "express";
import ConnectedRequest from "../globalTypes/ConnectedRequest";
import { SuperRoleEnum } from "roottypes";

const superAdminProtectMiddleware = async (
  req: ConnectedRequest<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new Error(
      "Didnt pass by the protect middleware before passing by the super admin protect middleware"
    );
  }

  if (req.user.superRole !== SuperRoleEnum.SuperAdmin) {
    throw new Error("Unauthorized");
  }
  next();
};

export default superAdminProtectMiddleware;
