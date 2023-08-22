import mongoose from "mongoose";
import { IUser, SuperRole } from "../user.model";

type UserUpdateCommand = {
  _id: mongoose.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  roleId?: string;
  superRole: SuperRole;
};

export default UserUpdateCommand;
