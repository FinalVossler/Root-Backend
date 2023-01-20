import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserRegisterCommand from "./dtos/UserRegisterCommand";
import UserLoginCommand from "./dtos/UserLoginCommand";
import userRepository from "./user.repository";
import { IUser } from "./user.model";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import mongoose, { ObjectId } from "mongoose";

const userService = {
  get: async (currentUserId?: ObjectId): Promise<IUser[]> => {
    const users: IUser[] = await userRepository.get(currentUserId);

    return users;
  },
  register: async (
    command: UserRegisterCommand
  ): Promise<{ user: IUser; token: string }> => {
    const user: IUser = await userRepository.save(command);

    const token: string = userService.generateToken(user);

    return { token, user };
  },
  login: async (
    command: UserLoginCommand
  ): Promise<{ token: string; user: IUser }> => {
    const user: IUser = await userRepository.getByEmail(command.email);

    if (user === null) {
      throw new Error("User not found");
    }

    const validPassword: boolean = await bcrypt.compare(
      command.password,
      user.password
    );

    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const token: string = userService.generateToken(user);

    return { token, user };
  },
  update: async (command: UserUpdateCommand): Promise<IUser> => {
    const user: IUser = await userRepository.update(command);

    return user;
  },
  getByToken: async (token: string): Promise<IUser> => {
    const signedUser: { _id: mongoose.ObjectId } = jwt.decode(token) as IUser;

    const user: IUser = await userRepository.getbyId(signedUser._id);

    return user;
  },
  generateToken: (user: IUser): string => {
    const toSign = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    // @ts-ignore
    const secret: string = process.env.JWT_SECRET;

    const token: string = jwt.sign(
      // @ts-ignore
      toSign,
      secret,
      {
        // @ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN,
      }
    );

    return token;
  },
};

export default userService;
