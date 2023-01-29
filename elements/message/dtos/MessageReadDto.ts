import { IMessage } from "../message.model";

type MessageReadDto = {
  _id: IMessage["_id"];
  from: IMessage["from"];
  to: IMessage["to"];
  message: IMessage["message"];
  read: IMessage["read"];
  files: IMessage["files"];
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
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

export default MessageReadDto;
