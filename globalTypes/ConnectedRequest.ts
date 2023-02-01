import { Request } from "express";

import { IUser } from "../elements/user/user.model";

interface ConnectedRequest<A, B, C, D> extends Request<A, B, C, D> {
  user?: IUser;
}

export default ConnectedRequest;
