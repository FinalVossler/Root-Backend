import { IMessage, IPopulatedMessage } from "../message.model";
import { toReadDto as reactionToReadDto } from "../../reaction/dtos/ReactionReadDto";

type MessageReadDto = {
  _id: IMessage["_id"] | IPopulatedMessage["_id"];
  from: IMessage["from"] | IPopulatedMessage["from"];
  to: IMessage["to"] | IPopulatedMessage["to"];
  message: IMessage["message"];
  read: IMessage["read"] | IPopulatedMessage["read"];
  files: IMessage["files"];
  totalUnreadMessages?: number;
  reactions?: IMessage["reactions"];
  createdAt: IMessage["createdAt"];
  updatedAt: IMessage["updatedAt"];
};

export const toReadDto = (
  message: IMessage | IPopulatedMessage
): MessageReadDto => {
  return {
    _id: message._id,
    from: message.from,
    to: message.to,
    message: message.message,
    read: message.read,
    files: message.files,
    reactions: message.reactions?.map((r) => reactionToReadDto(r)) || [],
    totalUnreadMessages: message["totalUnreadMessages"],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

export default MessageReadDto;
