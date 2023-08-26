import mongoose from "mongoose";
import moment from "moment";

import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import Message, { IMessage, IPopulatedMessage } from "./message.model";
import { IFile } from "../file/file.model";
import fileRepository from "../file/file.repository";
import { IUser } from "../user/user.model";
import MessageGetLastConversations from "./dtos/MessageGetLastConversations";

const getReadAtByUser = (userId: string) => userId + "-" + moment().toString();

const messageRepository = {
  sendMessage: async (
    command: MessageSendCommand,
    currentUser: IUser
  ): Promise<IPopulatedMessage> => {
    let createdFiles: IFile[] = await fileRepository.createFiles(
      command.files,
      currentUser
    );

    const message = await Message.create({
      from: command.from,
      to: command.to,
      message: command.message,
      read: [command.from],
      readAt: [getReadAtByUser(command.from.toString())],
      files: createdFiles.map((el) => el._id),
    });

    const populatedMessage: IPopulatedMessage = await message.populate(
      populationOptions
    );

    return populatedMessage;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] = (await Message.find({
      to: { $all: command.usersIds },
      numberOfParticipants: command.usersIds.length,
    })
      .populate("files")
      .populate("reactions")
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate({
        path: "reactions",
        model: "reaction",
        populate: {
          path: "user",
          model: "user",
        },
      })
      .exec()) as IMessage[];

    return messages.reverse();
  },
  getByIds: async (messagesIds: string[]): Promise<IPopulatedMessage[]> => {
    const messages: IPopulatedMessage[] = await Message.find({
      _id: { $in: messagesIds },
    }).populate(populationOptions);

    return messages;
  },
  markAllConversationMessagesAsReadByUser: async (
    to: string[],
    userId: mongoose.ObjectId
  ): Promise<IMessage | null> => {
    await Message.updateMany(
      {
        to: {
          $all: to.map((el) => new mongoose.Types.ObjectId(el)),
        },
        read: { $nin: new mongoose.Types.ObjectId(userId.toString()) },
      },
      {
        $addToSet: { read: userId, readAt: getReadAtByUser(userId.toString()) },
      }
    );

    const command: MessageGetBetweenUsersCommand = {
      paginationCommand: {
        limit: 1,
        page: 1,
      },
      usersIds: to.map((el) => new mongoose.Types.ObjectId(el)),
    };
    const lastMarkedMessageAsRead: IMessage[] =
      await messageRepository.getMessagesBetweenUsers(command);

    if (lastMarkedMessageAsRead.length > 0) {
      return lastMarkedMessageAsRead[0];
    } else {
      return null;
    }
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
    usersIds: string[],
    currentUserId: string
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
  getLastConversationsLastMessages: async (
    command: MessageGetLastConversations,
    currentUser: IUser
  ): Promise<{ messages: IPopulatedMessage[]; total: number }> => {
    const lastConversationsLastMessagesIds = await Message.aggregate([
      {
        $match: {
          to: { $all: [currentUser._id] },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$to",
          id: { $last: "$_id" },
          message: { $last: "$message" },
        },
      },
      {
        $skip:
          (command.paginationCommand.page - 1) *
          command.paginationCommand.limit,
      },
      { $limit: command.paginationCommand.limit },
    ]).exec();

    const messages: IPopulatedMessage[] = await messageRepository.getByIds(
      lastConversationsLastMessagesIds.map((el) => el.id.toString())
    );

    // Fetch the total number of unread messages by the user for each message conversation
    const getConversationTotalUnreadMessagesPromises: Promise<number>[] = [];

    messages.forEach((message) => {
      getConversationTotalUnreadMessagesPromises.push(
        new Promise(async (resolve) => {
          const conversationTotalUnreadMessages =
            await messageRepository.getTotalUnreadMessages(
              [...message.to.map((el) => el._id.toString())],
              currentUser._id.toString()
            );

          message.totalUnreadMessages = conversationTotalUnreadMessages;

          resolve(conversationTotalUnreadMessages);
        })
      );
    });
    await Promise.all(getConversationTotalUnreadMessagesPromises);

    let total = 0;
    try {
      // TODO fetch the total:
      total = (
        await Message.aggregate([
          {
            $match: {
              to: { $all: [currentUser._id] },
            },
          },
          {
            $group: {
              _id: "$to",
              id: { $last: "$_id" },
              message: { $last: "$message" },
            },
          },
          {
            $count: "count",
          },
        ])
      )[0].count;
    } catch (e) {
      total = 0;
    }

    return { messages: messages.reverse(), total };
  },
  getUserTotalUnreadMessages: async (userId: string): Promise<number> => {
    const totalUnreadMessages: number = await Message.find({
      to: { $in: [new mongoose.Types.ObjectId(userId)] },
      read: { $nin: [new mongoose.Types.ObjectId(userId)] },
    }).count();

    return totalUnreadMessages;
  },
  getById: async (messageId: string): Promise<IMessage> => {
    const message: IMessage = await Message.findOne({
      _id: new mongoose.Types.ObjectId(messageId),
    });

    return message;
  },
  getUserLastReadMessageInConversation: async ({
    to,
    userId,
  }: {
    to: string[];
    userId: string;
  }): Promise<IMessage | null> => {
    const messages: IMessage[] = (await Message.find({
      to: { $all: to },
      numberOfParticipants: to.length,
      read: { $in: new mongoose.Types.ObjectId(userId) },
    })
      .populate("files")
      .populate("reactions")
      .sort({ createdAt: -1 })
      .limit(1)
      .exec()) as IMessage[];

    if (messages.length > 0) {
      return messages[0];
    } else {
      return null;
    }
  },
};

const populationOptions = [
  {
    path: "files",
    model: "file",
  },
  {
    path: "from",
    model: "user",
    populate: {
      path: "profilePicture",
      model: "file",
    },
  },
  {
    path: "to",
    model: "user",
    populate: {
      path: "profilePicture",
      model: "file",
    },
  },
  {
    path: "reactions",
    model: "reaction",
    populate: {
      path: "user",
      model: "user",
    },
  },
];

export default messageRepository;
