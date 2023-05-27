import socket from "socket.io";
import http from "http";
import mongoose from "mongoose";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";
import NotificationMessageEnum from "./globalTypes/NotificationMessageEnum";
import NotificationReadDto from "./elements/notification/dto/NotificationReadDto";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socketHandler: {
  io: socket.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
} = {
  io: null,
};

export const onlineUsers = new Map<string, string>();

const init = (server: http.Server) => {
  const io = new socket.Server(server, {
    cors: { origin: "*" },
    // TODO: FIX LATER. It's not working on heroku for whatever reason
    // cors: { origin: process.env.ORIGIN },
  });

  socketHandler.io = io;

  io.on("connection", (socket: socket.Socket) => {
    const userId: any = socket.handshake.query.userId;

    onlineUsers.set(userId, socket.id);

    // Chat messages
    socket.on(ChatMessagesEnum.Delete, (message: MessageReadDto) => {
      message.to.forEach((userId: mongoose.ObjectId) => {
        if (onlineUsers.has(userId.toString())) {
          const userSocketId: string = onlineUsers.get(userId.toString());
          socket.to(userSocketId).emit(ChatMessagesEnum.Delete, message);
        }
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.set(userId, null);
    });
  });
};

export default init;
