import mongoose from "mongoose";

import { IUser } from "../user/user.model";

export interface ITypingState {
  toUsersIds: string[];
}

export interface ISocket {
  user: IUser;
  socketIds: string[];
  typingStates: ITypingState[];
}

interface SocketModel extends mongoose.Model<ISocket> {}

const SocketSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
  },
  socketIds: [
    {
      type: mongoose.SchemaTypes.String,
    },
  ],
  // Used as a reference to know to who to send socket messages saying that the user is no longer typing after he disconnects
  typingStates: [
    {
      toUsersIds: [{ type: mongoose.SchemaTypes.String }],
    },
  ],
});

export default mongoose.model<ISocket, SocketModel>("socket", SocketSchema);
