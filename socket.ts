import socket from "socket.io";
import http from "http";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import NotificationMessageEnum from "./globalTypes/NotificationMessageEnum";
import NotificationReadDto from "./elements/notification/dto/NotificationReadDto";
import ReactionReadDto from "./elements/reaction/dtos/ReactionReadDto";
import SocketTypingStateCommand from "./globalTypes/SocketTypingStateCommand";
import { IUser } from "./elements/user/user.model";
import userService from "./elements/user/user.service";
import emailService from "./elements/email/email.service";
import websiteConfigurationService from "./elements/websiteConfiguration/websiteConfiguration.service";
import socketRepository from "./elements/socket/socket.repository";
import { ISocket } from "./elements/socket/socket.model";
import { toReadDto } from "./elements/user/dtos/UserReadDto";

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

const init = (server: http.Server) => {
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
          const typingStateCommand: SocketTypingStateCommand = {
            isTyping: false,
            toUsersIds: typingState.toUsersIds,
            user: toReadDto(userSocket.user),
            userId: userId,
          };

          socketEmit({
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
      async (socketTypingStateCommand: SocketTypingStateCommand) => {
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
        socketEmit({
          messageType: ChatMessagesEnum.ReceiveTypingState,
          object: socketTypingStateCommand,
          userIds: socketTypingStateCommand.toUsersIds.filter(
            (u) => u !== userId
          ),
        });
      }
    );
  });
};

export const socketEmit = async ({
  userIds,
  messageType,
  object,
}: {
  userIds: string[];
  messageType: ChatMessagesEnum | NotificationMessageEnum;
  object:
    | NotificationReadDto
    | MessageReadDto
    | SocketTypingStateCommand
    | { reaction: ReactionReadDto; message: MessageReadDto }
    | { lastMarkedMessageAsRead: MessageReadDto | null; by: IUser };
}) => {
  const { onlineUsersIds, onlineUsersSockets } =
    await socketRepository.getOnlineUsers();

  const onlineConcernedUsersIds: string[] = userIds
    .map((userId) => userId.toString())
    .filter((userId) => onlineUsersIds.some((el) => el === userId.toString()));

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

  if (onlineConcernedUsersIds.length > 0) {
    const socketIds: string[] = onlineConcernedUsersIds.reduce(
      //@ts-ignore
      (acc: string[], userId) =>
        acc.concat(
          onlineUsersSockets.find((el) => el.user._id.toString() === userId)
            ?.socketIds || []
        ),
      []
    );

    socketHandler.io?.to(socketIds).emit(messageType, object);
  }
};

export default init;
