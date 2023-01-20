import { IUser } from "../user.model";

type LoginUserCommand = {
  email: IUser["email"];
  password: IUser["password"];
};

export default LoginUserCommand;
