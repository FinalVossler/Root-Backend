import mongoose from "mongoose";
import { IUser } from "../user/user.model";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import Message, { IMessage } from "./message.model";

const messageRespository = {
  sendMessage: async (command: MessageSendCommand): Promise<IMessage> => {
    const message: IMessage = (await Message.create({
      from: command.from,
      to: command.to,
      message: command.message,
      read: [command.from],
    })) as IMessage;

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] = (await Message.find({
      to: { $all: command.usersIds },
      numberOfParticipants: command.usersIds.length,
    })
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)) as IMessage[];

    return messages.reverse();
  },
  markMessagesAsReadBy: async (
    messages: IMessage[],
    userId: mongoose.ObjectId
  ): Promise<void> => {
    await Message.updateMany(
      { _id: { $in: messages.map((m) => m._id) } },
      { $addToSet: { read: userId } }
    );
  },
  getTotalMessages: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<number> => {
    const count: number = await Message.find({
      to: { $all: command.usersIds },
      numberOfParticipants: command.usersIds.length,
    }).count();

    return count;
  },
  getTotalUnreadMessages: async (
    usersIds: mongoose.ObjectId[],
    currentUserId: mongoose.ObjectId
  ): Promise<number> => {
    const total: number = await Message.find({
      read: { $ne: currentUserId },
      to: { $all: usersIds },
      numberOfParticipants: usersIds.length,
    }).count();

    return total;
  },
};

export default messageRespository;
