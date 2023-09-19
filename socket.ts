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

const onlineUsers = new Map<string, string[]>();
const usersTypingStates = new Map<
  string,
  SocketTypingStateCommand[] | undefined
>();

const init = (server: http.Server) => {
  const io = new socket.Server(server, {
    cors: { origin: "*" },
    // TODO: FIX LATER. It's not working on heroku for whatever reason
    // cors: { origin: process.env.ORIGIN },
  });

  socketHandler.io = io;

  // Managing connections and disconnections
  io.on("connection", (socket: socket.Socket) => {
    const userId: any = socket.handshake.query.userId;
    console.log("connecting", userId, "socket id", socket.id);

    const userSocketsIds: string[] = onlineUsers.get(userId) || [];

    onlineUsers.set(userId, [...userSocketsIds, socket.id]);

    socket.on("disconnect", () => {
      const userSocketsIds: string[] | undefined =
        onlineUsers.get(userId) || [];

      console.log("disconnecting", userId, "socket id", socket.id);
      onlineUsers.set(
        userId,
        userSocketsIds.filter((socketId) => socketId !== socket.id)
      );
      usersTypingStates.set(userId, undefined);
    });

    // Listening to typing states
    socket.on(
      ChatMessagesEnum.SendTypingState,
      (socketTypingStateCommand: SocketTypingStateCommand) => {
        const userTypingStates = usersTypingStates.get(
          socketTypingStateCommand.userId
        );

        // If the user is tyuping, then we add the typing state to the map.
        if (socketTypingStateCommand.isTyping) {
          usersTypingStates.set(socketTypingStateCommand.userId, [
            ...(userTypingStates || []),
            socketTypingStateCommand,
          ]);
        } else {
          // If the user is not typing, then we remove the typing state from the map.
          const newUserTypingStates = (userTypingStates || []).filter(
            (el) =>
              JSON.stringify(el.toUsersIds.sort()) ===
              JSON.stringify(socketTypingStateCommand.toUsersIds.sort())
          );
          usersTypingStates.set(
            socketTypingStateCommand.userId,
            newUserTypingStates
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
  const onlineConcernedUsersIds: string[] = userIds
    .map((userId) => userId.toString())
    .filter((userId) => onlineUsers.has(userId.toString()));

  if (messageType === ChatMessagesEnum.Receive) {
    const offlineConcernedUsersIds: string[] = userIds
      .map((userId) => userId.toString())
      .filter(
        (userId) =>
          !onlineUsers.has(userId.toString()) ||
          onlineUsers.get(userId.toString())?.length === 0 ||
          onlineUsers.get(userId.toString()) === undefined
      );

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
      (acc, userId) => acc.concat(onlineUsers.get(userId) || []),
      []
    );

    socketHandler.io?.to(socketIds).emit(messageType, object);
  }
};

export default init;
