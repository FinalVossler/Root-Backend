import mongoose from "mongoose";

import { IUser } from "../user.model";

type UserReadDto = {
  _id: mongoose.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  profilePicture: IUser["profilePicture"];
  role: IUser["role"];
};

export const toReadDto = (user: IUser): UserReadDto => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    role: user.role,
  };
};

export default UserReadDto;
