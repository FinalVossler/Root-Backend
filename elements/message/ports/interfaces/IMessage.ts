import IFile from "../../../file/ports/interfaces/IFile";
import IReaction from "../../../reaction/ports/interfaces/IReaction";

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
