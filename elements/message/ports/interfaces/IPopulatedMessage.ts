import { IFile } from "../../../file/adapters/file.mongoose.model";
import { IReaction } from "../../../reaction/adapters/reaction.mongoose.model";
import IUser from "../../../user/ports/interfaces/IUser";

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
