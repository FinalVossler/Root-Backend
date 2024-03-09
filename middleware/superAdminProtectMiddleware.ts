import { Response, NextFunction } from "express";
import IConnectedExpressRequest from "../globalTypes/IConnectedExpressRequest";
import { SuperRoleEnum } from "roottypes";

const superAdminProtectMiddleware = async (
  req: IConnectedExpressRequest<any, any, any, any>,
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
