import mongoose from "mongoose";
import moment from "moment";

import Message from "./message.mongoose.model";
import fileRepository from "../../file/adapters/file.mongoose.repository";
import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageSendCommand,
} from "roottypes";
import IUser from "../../user/ports/interfaces/IUser";
import IPopulatedMessage from "../ports/interfaces/IPopulatedMessage";
import IMessage from "../ports/interfaces/IMessage";
import IFile from "../../file/ports/interfaces/IFile";

const getReadAtByUser = (userId: string) => userId + "-" + moment().toString();

const messageMongooseRepository = {
  sendMessage: async (
    command: IMessageSendCommand,
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
    command: IMessageGetBetweenUsersCommand
  ): Promise<IPopulatedMessage[]> => {
    const messages: IPopulatedMessage[] = await Message.find({
      to: { $all: command.usersIds },
      numberOfParticipants: command.usersIds.length,
    })
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    return messages.reverse();
  },
  getByIds: async (messagesIds: string[]): Promise<IPopulatedMessage[]> => {
    const messages: IPopulatedMessage[] = await Message.find({
      _id: { $in: messagesIds },
    }).populate(populationOptions);

    return messages;
  },
  markAllConversationMessagesAsReadByUser: async function (
    to: string[],
    userId: string
  ): Promise<IPopulatedMessage | null> {
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

    const command: IMessageGetBetweenUsersCommand = {
      paginationCommand: {
        limit: 1,
        page: 1,
      },
      usersIds: to,
    };
    const lastMarkedMessageAsRead: IPopulatedMessage[] =
      await this.getMessagesBetweenUsers(command);

    if (lastMarkedMessageAsRead.length > 0) {
      return lastMarkedMessageAsRead[0];
    } else {
      return null;
    }
  },
  getTotalMessages: async (
    command: IMessageGetBetweenUsersCommand
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
  getMessage: async (messageId: string): Promise<IPopulatedMessage> => {
    const message: IPopulatedMessage = (await Message.findById(
      messageId
    ).populate(populationOptions)) as IPopulatedMessage;
    return message;
  },
  getLastConversationsLastMessages: async function (
    command: IMessageGetLastConversations,
    currentUser: IUser
  ): Promise<{ messages: IPopulatedMessage[]; total: number }> {
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
        $facet: {
          calculateTotal: [
            {
              $count: "total",
            },
          ],
          data: [
            {
              $skip:
                (command.paginationCommand.page - 1) *
                command.paginationCommand.limit,
            },
            { $limit: command.paginationCommand.limit },
            {
              $lookup: {
                from: "message",
                localField: "id",
                foreignField: "_id",
                as: "message",
              },
            },
          ],
        },
      },
    ]).exec();

    const messages: IPopulatedMessage[] = await this.getByIds(
      lastConversationsLastMessagesIds[0]["data"].map((el) => el.id.toString())
    );

    const total =
      lastConversationsLastMessagesIds?.[0].calculateTotal?.[0]?.total || 0;

    // Fetch the total number of unread messages by the user for each message conversation
    const getConversationTotalUnreadMessagesPromises: Promise<number>[] = [];

    messages.forEach((message) => {
      getConversationTotalUnreadMessagesPromises.push(
        new Promise(async (resolve) => {
          const conversationTotalUnreadMessages =
            await this.getTotalUnreadMessages(
              [...message.to.map((el) => el._id.toString())],
              currentUser._id.toString()
            );

          message.totalUnreadMessages = conversationTotalUnreadMessages;

          resolve(conversationTotalUnreadMessages);
        })
      );
    });
    await Promise.all(getConversationTotalUnreadMessagesPromises);

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
    const message: IMessage | null = await Message.findOne({
      _id: new mongoose.Types.ObjectId(messageId),
    });

    if (!message) {
      throw new Error("Message not found");
    }

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

export default messageMongooseRepository;
