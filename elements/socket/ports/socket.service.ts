import socket from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

import {
  ChatMessagesEnum,
  IMessageReadDto,
  INotificationReadDto,
  IPopulatedMessageReadDto,
  IReactionReadDto,
  ISocketTypingStateCommand,
  IUserReadDto,
  NotificationMessageEnum,
} from "roottypes";

import { userToReadDto } from "../../user/ports/user.toReadDto";
import IUser from "../../user/ports/interfaces/IUser";
import ISocketService from "./interfaces/ISocketService";
import ISocket from "./interfaces/ISocket";
import IWebsiteConfigurationService from "../../websiteConfiguration/ports/interfaces/IWebsiteConfigurationService";
import IEmailService from "../../email/ports/interfaces/IEmailService";
// TODO: Get rid of external dependency
import { userService } from "../../../ioc";
import ISocketRepository from "./interfaces/ISocketRepository";

const socketHandler: {
  io: socket.Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  > | null;
} = {
  io: null,
};

export const createSocketService = (
  websiteConfigurationService: IWebsiteConfigurationService,
  emailService: IEmailService,
  socketRepository: ISocketRepository
): ISocketService => ({
  socketInit: function (server: http.Server) {
    const io = new socket.Server(server, {
      cors: { origin: "*" },
      // TODO: FIX LATER. It's not working on heroku for whatever reason
      // cors: { origin: process.env.ORIGIN },
    });

    socketHandler.io = io;

    // Managing connections and disconnections
    io.on("connection", async (socket: socket.Socket) => {
      const userId: any = socket.handshake.query.userId;
      console.log("connecting", userId, "socket id", socket.id);

      await socketRepository.addSocketId(userId, socket.id);

      socket.on("disconnect", async () => {
        console.log("disconnecting", userId, "socket id", socket.id);

        // Send messages signaling to other users that this user is no longer typing because he just disconnected
        const userSocket: ISocket | null = await socketRepository.getUserSocket(
          userId
        );
        if (userSocket) {
          userSocket.typingStates.forEach((typingState) => {
            const typingStateCommand: ISocketTypingStateCommand = {
              isTyping: false,
              toUsersIds: typingState.toUsersIds,
              user: (userSocket.user
                ? userToReadDto(userSocket.user)
                : null) as IUserReadDto,
              userId: userId,
            };

            this.socketEmit({
              messageType: ChatMessagesEnum.ReceiveTypingState,
              object: typingStateCommand,
              userIds: typingState.toUsersIds.filter((u) => u !== userId),
            });
          });
        }

        await socketRepository.deleteSocketId(userId, socket.id);
      });

      // Listening to typing states
      socket.on(
        ChatMessagesEnum.SendTypingState,
        async (socketTypingStateCommand: ISocketTypingStateCommand) => {
          if (socketTypingStateCommand.isTyping) {
            await socketRepository.addTypingState(
              socketTypingStateCommand.userId,
              { toUsersIds: socketTypingStateCommand.toUsersIds }
            );
          } else {
            await socketRepository.deleteTypingState(
              socketTypingStateCommand.userId,
              { toUsersIds: socketTypingStateCommand.toUsersIds }
            );
          }
          this.socketEmit({
            messageType: ChatMessagesEnum.ReceiveTypingState,
            object: socketTypingStateCommand,
            userIds: socketTypingStateCommand.toUsersIds.filter(
              (u) => u !== userId
            ),
          });
        }
      );
    });
  },
  socketEmit: async function ({
    userIds,
    messageType,
    object,
  }: {
    userIds: string[];
    messageType: ChatMessagesEnum | NotificationMessageEnum;
    object:
      | INotificationReadDto
      | IPopulatedMessageReadDto
      | ISocketTypingStateCommand
      | { reaction: IReactionReadDto; message: IMessageReadDto }
      | { lastMarkedMessageAsRead: IPopulatedMessageReadDto | null; by: IUser };
  }) {
    // Get online users and their sockets
    const { onlineUsersIds, onlineUsersSockets } =
      await socketRepository.getOnlineUsers();

    // Find online concerned users amongst all online users (Todo: need to do this )
    const onlineConcernedUsersIds: string[] = userIds
      .map((userId) => userId.toString())
      .filter((userId) =>
        onlineUsersIds.some((el) => el === userId.toString())
      );

    if (messageType === ChatMessagesEnum.Receive) {
      const offlineConcernedUsersIds: string[] = userIds
        .map((userId) => userId.toString())
        .filter((userId) => !onlineUsersIds.some((el) => el === userId));

      const sendEmailsToOfflineUsersPromises: Promise<void>[] = [];
      if (offlineConcernedUsersIds.length > 0) {
        const configuration = await websiteConfigurationService.get();

        offlineConcernedUsersIds.forEach((userId) => {
          sendEmailsToOfflineUsersPromises.push(
            new Promise(async (resolve, reject) => {
              const user: IUser = await userService.getById(userId);
              if (user.hasMessagingEmailsActivated) {
                try {
                  await emailService.sendEmail({
                    subject: configuration.title + ": Message received",
                    text:
                      "Somebody messaged you on " +
                      configuration.title +
                      ".\nClick the following link: " +
                      process.env.ORIGIN +
                      ". You can deactivate this notification in your profile settings.",
                    to: user.email,
                  });

                  resolve();
                } catch {
                  reject(null);
                }
              }
            })
          );
        });
      }

      Promise.all(sendEmailsToOfflineUsersPromises);
    }

    // concat all sockets ids of concerned only users (one user can have many socket ids: mobile, web ,etc...)
    if (onlineConcernedUsersIds.length > 0) {
      const socketIds: string[] = onlineConcernedUsersIds.reduce(
        //@ts-ignore
        (acc: string[], userId) =>
          acc.concat(
            onlineUsersSockets.find((el) => el.user?._id.toString() === userId)
              ?.socketIds || []
          ),
        []
      );

      socketHandler.io?.to(socketIds).emit(messageType, object);
    }
  },
});

export default createSocketService;
