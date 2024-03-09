import { Request, Response } from "express";

import Unpromisify from "../globalTypes/Unpromisify";
import adapatExpressRequest from "./adaptExpressRequest";
import IConnectedExpressRequest from "../globalTypes/IConnectedExpressRequest";

export type ExpressController<
  T extends { [key: string]: (...args: any[]) => any }
> = {
  [key in keyof T]: () => Promise<Response<Unpromisify<ReturnType<T[key]>>>>;
};

const createExpressController = <
  T extends { [key: string]: (...args: any[]) => any }
>(
  controller: T
): ExpressController<T> => {
  const expressController = {};
  Object.keys(controller).forEach((key) => {
    expressController[key] = async (
      req: Request | IConnectedExpressRequest<any, any, any, any>,
      res: Response
    ) => {
      const result = await controller[key](
        adapatExpressRequest(req),
        req["user"]
      );

      res.status(200).send(result);
    };
  });

  return expressController as T;
};

export default createExpressController;
