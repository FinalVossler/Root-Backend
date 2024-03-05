import { Request } from "express";
import IRequest from "../globalTypes/IRequest";

const adapatExpressRequest = (req: Request): IRequest => {
  return {
    body: req.body,
    params: req.params,
    query: req.query,
  };
};

export default adapatExpressRequest;
