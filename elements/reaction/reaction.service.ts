import { IUser } from "../user/user.model";
import { socketEmit } from "../../socket";
import { IReaction } from "./reaction.model";
import reactionRepository from "./reaction.repository";
import { IMessage } from "../message/message.model";
import messageService from "../message/message.service";
import {
  ChatMessagesEnum,
  IReactionCreateCommand,
  IReactionReadDto,
} from "roottypes";
import { reactionToReadDto } from "./reaction.toReadDto";
import { messageToReadDto } from "../message/messageToReadDto";

const reactionService = {
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
};

export default reactionService;
