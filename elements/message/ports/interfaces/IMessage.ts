import { IFile } from "../../../file/adapters/file.mongoose.model";
import { IReaction } from "../../../reaction/adapters/reaction.mongoose.model";

export default interface IMessage {
  _id: string;
  from: string;
  to: string[];
  message: string;
  numberOfParticipants?: number;
  read: string[];
  readAt?: string[];
  files: (IFile | string)[];
  reactions?: (IReaction | string)[];

  createdAt: string;
  updatedAt: string;
}
