import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageRespository from "./message.repository";

const messageService = {
  sendMessage: async (command: MessageSendCommand): Promise<IMessage> => {
    const message: IMessage = await messageRespository.sendMessage(command);

    console.log("message", message, "command", command);
    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRespository.getMessagesBetweenUsers(command);

    return messages;
  },
};

export default messageService;
