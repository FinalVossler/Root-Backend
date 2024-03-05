import { Request } from "express";

import { IUser } from "../elements/user/adapters/user.mongoose.model";

interface IConnectedRequest<A, B, C, D> extends Request<A, B, C, D> {
  user: IUser;
}

export default IConnectedRequest;
