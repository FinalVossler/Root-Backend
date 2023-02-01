import socket from "socket.io";
import http from "http";
import mongoose from "mongoose";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";

const init = (server: http.Server) => {
  const io = new socket.Server(server, {
    cors: { origin: process.env.ORIGIN },
  });
  const onlineUsers = new Map<mongoose.ObjectId, string>();

  io.on("connection", (socket: socket.Socket) => {
    const userId: any = socket.handshake.query.userId;

    onlineUsers.set(userId, socket.id);

    socket.on(ChatMessagesEnum.Send, (message: MessageReadDto) => {
      message.to.forEach((userId: mongoose.ObjectId) => {
        if (onlineUsers.has(userId)) {
          const userSocketId: string = onlineUsers.get(userId);
          socket.to(userSocketId).emit(ChatMessagesEnum.Receive, message);
        }
      });
    });

    socket.on(ChatMessagesEnum.Delete, (message: MessageReadDto) => {
      message.to.forEach((userId: mongoose.ObjectId) => {
        if (onlineUsers.has(userId)) {
          const userSocketId: string = onlineUsers.get(userId);
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
