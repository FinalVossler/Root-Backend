import { socketEmit } from "../../../socket";
import {
  ChatMessagesEnum,
  IReactionCreateCommand,
  IReactionReadDto,
} from "roottypes";
import { reactionToReadDto } from "./reaction.toReadDto";
import { messageToReadDto } from "../../message/ports/message.toReadDto";
import IReactionService from "./interfaces/IReactionService";
import IMessageService from "../../message/ports/interfaces/IMessageService";
import IReactionRepository from "./interfaces/IReactionRepository";
import IUser from "../../user/ports/interfaces/IUser";
import IMessage from "../../message/ports/interfaces/IMessage";
import IReaction from "./interfaces/IReaction";

const createReactionService = (
  reactionRepository: IReactionRepository,
  messageService: IMessageService
): IReactionService => ({
  create: async (
    command: IReactionCreateCommand,
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
        reaction: reactionToReadDto(reaction) as IReactionReadDto,
      },
      userIds: message.to.map((user) => user.toString()),
    });

    return reaction;
  },
});

export default createReactionService;
