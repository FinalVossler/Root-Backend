import socket from "socket.io";
import http from "http";
import mongoose from "mongoose";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";
import NotificationMessageEnum from "./globalTypes/NotificationMessageEnum";
import NotificationReadDto from "./elements/notification/dto/NotificationReadDto";

export const socketHandler: { socket: socket.Socket } = {
  socket: null,
};

export const onlineUsers = new Map<string, string>();

const init = (server: http.Server) => {
  const io = new socket.Server(server, {
    cors: { origin: "*" },
    // TODO: FIX LATER. It's not working on heroku for whatever reason
    // cors: { origin: process.env.ORIGIN },
  });

  io.on("connection", (socket: socket.Socket) => {
    socketHandler.socket = socket;

    const userId: any = socket.handshake.query.userId;

    onlineUsers.set(userId, socket.id);

    // Chat messages
    socket.on(ChatMessagesEnum.Send, (message: MessageReadDto) => {
      message.to.forEach((userId: mongoose.ObjectId) => {
        if (onlineUsers.has(userId.toString())) {
          const userSocketId: string = onlineUsers.get(userId.toString());
          socket.to(userSocketId).emit(ChatMessagesEnum.Receive, message);
        }
      });
    });

    socket.on(ChatMessagesEnum.Delete, (message: MessageReadDto) => {
      message.to.forEach((userId: mongoose.ObjectId) => {
        if (onlineUsers.has(userId.toString())) {
          const userSocketId: string = onlineUsers.get(userId.toString());
          socket.to(userSocketId).emit(ChatMessagesEnum.Delete, message);
        }
      });
    });

    // In app Notifications
    socket.on(
      NotificationMessageEnum.Send,
      (notification: NotificationReadDto) => {
        notification.to.forEach((userId: mongoose.ObjectId) => {
          if (onlineUsers.has(userId.toString())) {
            const userSocketId: string = onlineUsers.get(userId.toString());
            socket
              .to(userSocketId)
              .emit(NotificationMessageEnum.Receive, notification);
          }
        });
      }
    );

    socket.on("disconnect", () => {
      onlineUsers.set(userId, null);
    });
  });
};

export default init;
