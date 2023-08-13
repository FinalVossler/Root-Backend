import { IMessage } from "../message.model";
import { toReadDto as reactionToReadDto } from "../../reaction/dtos/ReactionReadDto";

type MessageReadDto = {
  _id: IMessage["_id"];
  from: IMessage["from"];
  to: IMessage["to"];
  message: IMessage["message"];
  read: IMessage["read"];
  files: IMessage["files"];
  reactions: IMessage["reactions"];
  createdAt: IMessage["createdAt"];
  updatedAt: IMessage["updatedAt"];
};

export const toReadDto = (message: IMessage): MessageReadDto => {
  return {
    _id: message._id,
    from: message.from,
    to: message.to,
    message: message.message,
    read: message.read,
    files: message.files,
    reactions: message.reactions.map((r) => reactionToReadDto(r)),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

export default MessageReadDto;
