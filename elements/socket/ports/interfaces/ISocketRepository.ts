import ISocket, { ITypingState } from "./ISocket";

interface ISocketRepository {
  deleteSocketId: (userId: string, socketId: string) => Promise<void>;
  addSocketId: (userId: string, socketId: string) => Promise<void>;
  getOnlineUsers: () => Promise<{
    onlineUsersIds: string[];
    onlineUsersSockets: ISocket[];
  }>;
  getUserSocket: (userId: string) => Promise<ISocket | null>;
  addTypingState: (userId: string, typingState: ITypingState) => Promise<void>;
  deleteTypingState: (
    userId: string,
    typingState: ITypingState
  ) => Promise<void>;
}

export default ISocketRepository;
