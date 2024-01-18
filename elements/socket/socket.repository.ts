import mongoose from "mongoose";
import SocketModel, { ISocket, ITypingState } from "./socket.model";

const socketRepository = {
  deleteSocketId: async (userId: string, socketId: string) => {
    const socket: ISocket | null = await SocketModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).exec();

    if (socket) {
      if (socket?.socketIds.length === 1 && socket?.socketIds[0] === socketId) {
        await SocketModel.deleteOne({
          user: new mongoose.Types.ObjectId(userId),
        });
      } else {
        await SocketModel.updateOne(
          { user: new mongoose.Types.ObjectId(userId) },
          {
            $set: {
              socketIds: socket.socketIds.filter((el) => el !== socketId),
              typingStates: [],
            },
          }
        );
      }
    }
  },
  addSocketId: async (userId: string, socketId: string) => {
    const socket: ISocket | null = await SocketModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).exec();

    if (socket) {
      await SocketModel.updateOne(
        { user: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            socketIds: [...socket.socketIds, socketId],
          },
        }
      );
    } else {
      await SocketModel.create({
        user: new mongoose.Types.ObjectId(userId),
        socketIds: [socketId],
      });
    }
  },
  getOnlineUsers: async (): Promise<{
    onlineUsersIds: string[];
    onlineUsersSockets: ISocket[];
  }> => {
    const onlineUsersSockets = await SocketModel.find({
      socketIds: { $exists: true, $ne: [] },
    }).populate("user");

    return {
      onlineUsersIds: onlineUsersSockets.map((el) => el.user._id.toString()),
      onlineUsersSockets: onlineUsersSockets,
    };
  },
  getUserSocket: async (userId: string): Promise<ISocket | null> => {
    const socket: ISocket | null = await SocketModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate("user")
      .exec();

    return socket;
  },
  addTypingState: async (userId: string, typingState: ITypingState) => {
    await SocketModel.updateOne(
      {
        user: new mongoose.Types.ObjectId(userId),
      },
      { $push: { typingStates: typingState } }
    );
  },
  deleteTypingState: async (userId: string, typingState: ITypingState) => {
    await SocketModel.updateOne(
      {
        user: new mongoose.Types.ObjectId(userId),
      },
      { $pull: { typingStates: typingState } }
    );
  },
};

export default socketRepository;
