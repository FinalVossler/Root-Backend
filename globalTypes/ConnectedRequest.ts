import { Request } from "express";

import { IUser } from "../elements/user/user.model";

interface ConnectedRequest extends Request {
  user?: IUser;
}

export default ConnectedRequest;
