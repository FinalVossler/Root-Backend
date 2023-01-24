import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageRespository from "./message.repository";

const messageService = {
  sendMessage: async (command: MessageSendCommand): Promise<IMessage> => {
    const message: IMessage = await messageRespository.sendMessage(command);

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRespository.getMessagesBetweenUsers(command);

    return messages;
  },
  getTotalMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<number> => {
    const total: number = await messageRespository.getTotalMessages(command);

    return total;
  },
};

export default messageService;
