import { IMessage } from "../message.model";

type MessageReadDto = {
  _id: IMessage["_id"];
  from: IMessage["from"];
  to: IMessage["to"];
  message: IMessage["message"];
};

export const toReadDto = (message: IMessage): MessageReadDto => {
  return {
    _id: message._id,
    from: message.from,
    to: message.to,
    message: message.message,
  };
};

export default MessageReadDto;
