import { Request } from "express";

import { IUser } from "../elements/user/user.model";

interface ConnectedRequest<A, B, C> extends Request<A, B, C> {
  user?: IUser;
}

export default ConnectedRequest;
