import socket from "socket.io";
import http from "http";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import NotificationMessageEnum from "./globalTypes/NotificationMessageEnum";
import NotificationReadDto from "./elements/notification/dto/NotificationReadDto";

const socketHandler: {
  io: socket.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
} = {
  io: null,
};

const onlineUsers = new Map<string, string>();

const init = (server: http.Server) => {
  const io = new socket.Server(server, {
    cors: { origin: "*" },
    // TODO: FIX LATER. It's not working on heroku for whatever reason
    // cors: { origin: process.env.ORIGIN },
  });

  socketHandler.io = io;

  io.on("connection", (socket: socket.Socket) => {
    const userId: any = socket.handshake.query.userId;
    console.log("connecting", userId, "socket id", socket.id);

    onlineUsers.set(userId, socket.id);

    socket.on("disconnect", () => {
      console.log("disconnecting", userId, "socket id", socket.id);
      onlineUsers.set(userId, null);
    });
  });
};

export const socketEmit = ({
  userIds,
  messageType,
  object,
}: {
  userIds: string[];
  messageType: ChatMessagesEnum | NotificationMessageEnum;
  object: NotificationReadDto | MessageReadDto;
}) => {
  const onlineConcernedUsersIds: string[] = userIds
    .map((userId) => userId.toString())
    .filter((userId) => onlineUsers.has(userId.toString()));

  if (onlineConcernedUsersIds.length > 0) {
    const socketIds: string[] = onlineConcernedUsersIds.map((userId) =>
      onlineUsers.get(userId)
    );
    socketHandler.io.to(socketIds).emit(messageType, object);
  }
};

export default init;
