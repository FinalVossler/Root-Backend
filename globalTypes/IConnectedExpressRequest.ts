import { Request } from "express";

import IUser from "../elements/user/ports/interfaces/IUser";

interface IConnectedExpressRequest<A, B, C, D> extends Request<A, B, C, D> {
  user: IUser;
}

export default IConnectedExpressRequest;
