import mongoose from "mongoose";
import RoleReadDto, {
  toReadDto as roleReadDto,
} from "../../role/dto/RoleReadDto";

import { IUser } from "../user.model";

type UserReadDto = {
  _id: mongoose.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  profilePicture: IUser["profilePicture"];
  superRole: IUser["superRole"];
  role?: RoleReadDto;
};

export const toReadDto = (user: IUser): UserReadDto => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    superRole: user.superRole,
    role: roleReadDto(user.role),
  };
};

export default UserReadDto;
