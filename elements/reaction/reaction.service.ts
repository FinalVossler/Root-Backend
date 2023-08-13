import { IUser } from "../user/user.model";
import { socketEmit } from "../../socket";
import ChatMessagesEnum from "../../globalTypes/ChatMessagesEnum";
import { toReadDto } from "./dtos/ReactionReadDto";
import ReactionCreateCommand from "./dtos/ReactionCreateCommand";
import { IReaction } from "./reaction.model";
import reactionRepository from "./reaction.repository";
import { IMessage } from "../message/message.model";
import { toReadDto as messageToReadDto } from "../message/dtos/MessageReadDto";
import messageService from "../message/message.service";

const reactionService = {
  create: async (
    command: ReactionCreateCommand,
    currentUser: IUser
  ): Promise<IReaction> => {
    const reaction: IReaction = await reactionRepository.create(
      command,
      currentUser
    );

    const message: IMessage = await messageService.getById(command.messageId);

    socketEmit({
      messageType: ChatMessagesEnum.ReaceiveReaction,
      object: {
        message: messageToReadDto(message),
        reaction: toReadDto(reaction),
      },
      userIds: message.to.map((user) => user.toString()),
    });

    return reaction;
  },
};

export default reactionService;
