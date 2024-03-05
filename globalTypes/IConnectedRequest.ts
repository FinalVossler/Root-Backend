import { Request } from "express";
import IUser from "../elements/user/ports/interfaces/IUser";

interface IConnectedRequest<A, B, C, D> extends Request<A, B, C, D> {
  user: IUser;
}

export default IConnectedRequest;
