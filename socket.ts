import socket from "socket.io";
import http from "http";

import ChatMessagesEnum from "./globalTypes/ChatMessagesEnum";
import MessageReadDto from "./elements/message/dtos/MessageReadDto";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import NotificationMessageEnum from "./globalTypes/NotificationMessageEnum";
import NotificationReadDto from "./elements/notification/dto/NotificationReadDto";
import ReactionReadDto from "./elements/reaction/dtos/ReactionReadDto";
import SocketTypingStateCommand from "./globalTypes/SocketTypingStateCommand";

const socketHandler: {
  io: socket.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
} = {
  io: null,
};

const onlineUsers = new Map<string, string>();
const usersTypingStates = new Map<string, SocketTypingStateCommand[]>();

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

    onlineUsers.set(userId, socket.id);

    socket.on("disconnect", () => {
      console.log("disconnecting", userId, "socket id", socket.id);
      onlineUsers.set(userId, null);
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

export const socketEmit = ({
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
    | { reaction: ReactionReadDto; message: MessageReadDto };
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
