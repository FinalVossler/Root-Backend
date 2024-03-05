import mongoose from "mongoose";

import ISocket from "../ports/interfaces/ISocket";

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

const Socket = mongoose.model<ISocket, SocketModel>("socket", SocketSchema);

export default Socket;
