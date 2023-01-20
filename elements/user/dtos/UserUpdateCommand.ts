import mongoose from "mongoose";
import { IUser } from "../user.model";

type UserUpdateCommand = {
  _id: mongoose.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
};

export default UserUpdateCommand;
