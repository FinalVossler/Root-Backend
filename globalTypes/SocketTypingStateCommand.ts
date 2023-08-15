import UserReadDto from "../elements/user/dtos/UserReadDto";

export type SocketTypingStateCommand = {
  userId: string;
  user: UserReadDto;
  toUsersIds: string[];
  isTyping: boolean;
};

export default SocketTypingStateCommand;
