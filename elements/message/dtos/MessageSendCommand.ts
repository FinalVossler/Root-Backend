import { IMessage } from "../message.model";

type MessageSendCommand = {
  from: IMessage["from"];
  to: IMessage["to"];
  message: IMessage["message"];
};

export default MessageSendCommand;
