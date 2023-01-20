import mongoose from "mongoose";
import { IUser } from "../user.model";

type UserReadDto = {
  _id: mongoose.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
};

export const toReadDto = (user: IUser): UserReadDto => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
};

export default UserReadDto;
