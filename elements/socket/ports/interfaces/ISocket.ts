import IUser from "../../../user/ports/interfaces/IUser";

export default interface ISocket {
  user: IUser;
  socketIds: string[];
  typingStates: ITypingState[];
}

export interface ITypingState {
  toUsersIds: string[];
}
