import mongoose from "mongoose";

import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import Message, { IMessage } from "./message.model";
import { IFile } from "../file/file.model";
import fileRepository from "../file/file.repository";
import { IUser } from "../user/user.model";

const messageRepository = {
  sendMessage: async (
    command: MessageSendCommand,
    currentUser: IUser
  ): Promise<IMessage> => {
    let createdFiles: IFile[] = await fileRepository.createFiles(
      command.files,
      currentUser
    );

    const message = await Message.create({
      from: command.from,
      to: command.to,
      message: command.message,
      read: [command.from],
      files: createdFiles.map((el) => el._id),
    });

    await message.populate("files");

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] = (await Message.find({
      to: { $all: command.usersIds },
      numberOfParticipants: command.usersIds.length,
    })
      .populate("files")
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)) as IMessage[];

    return messages.reverse();
  },
  getByIds: async (messagesIds: string[]): Promise<IMessage[]> => {
    const messages: IMessage[] = await Message.find({
      _id: { $in: messagesIds },
    });

    return messages;
  },
  markMessagesAsReadByUser: async (
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
  deleteMessage: async (messageId: string) => {
    await Message.deleteOne({ _id: messageId }).exec();
  },
  getMessage: async (messageId: string): Promise<IMessage> => {
    const message: IMessage = (await Message.findById(
      messageId
    ).exec()) as IMessage;
    return message;
  },
};

export default messageRepository;
