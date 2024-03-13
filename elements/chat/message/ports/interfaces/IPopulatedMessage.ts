import IFile from "../../../../file/ports/interfaces/IFile";
import IReaction from "../../../reaction/ports/interfaces/IReaction";
import IUser from "../../../../user/ports/interfaces/IUser";

export default interface IPopulatedMessage {
  _id: string;
  from: IUser;
  to: IUser[];
  message: string;
  read: string[];
  readAt?: string[];
  files: IFile[];
  reactions?: IReaction[];
  totalUnreadMessages?: number;

  createdAt: string;
  updatedAt: string;
}
