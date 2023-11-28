import mongoose from "mongoose";
import { IUser, SuperRole } from "../user.model";

type UserUpdateCommand = {
  _id: mongoose.Types.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  roleId?: string;
  superRole?: SuperRole;
  hasMessagingEmailsActivated?: boolean;
};

export default UserUpdateCommand;
