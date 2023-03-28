import { decode, sign, verify } from "jsonwebtoken";
import { compare, genSalt, hash } from "bcrypt";

import UserRegisterCommand from "./dtos/UserRegisterCommand";
import UserLoginCommand from "./dtos/UserLoginCommand";
import userRepository from "./user.repository";
import { IUser } from "./user.model";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import mongoose, { ObjectId } from "mongoose";
import UserUpdateProfilePictureCommand from "./dtos/UserUpdateProfilePictureCommand";
import emailService from "../email/email.service";
import UserChangePasswordCommand from "./dtos/UserChangePasswordCommand";
import UserForgotPasswordChangePasswordCommand from "./dtos/UserForgotPasswordChangePasswordCommand";
import UserCreateCommand from "./dtos/UserCreateCommand";
import UsersGetCommand from "./dtos/UsersGetCommand";

const userService = {
  generatePasswordHash: async (password: string): Promise<string> => {
    const salt: string = await genSalt(10);

    const passwordHash: string = await hash(password, salt);

    return passwordHash;
  },
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

    const validPassword: boolean = await compare(
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
  updateProfilePictre: async (
    command: UserUpdateProfilePictureCommand,
    currentUser: IUser
  ): Promise<IUser> => {
    const user: IUser = await userRepository.updateProfilePicture(
      command,
      currentUser
    );

    return user;
  },
  getByToken: async (token: string): Promise<IUser> => {
    const signedUser: { _id: mongoose.ObjectId } = decode(token) as IUser;

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

    const token: string = sign(
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
  sendChangePasswordEmail: async (userEmail: string) => {
    const currentUser: IUser = await userRepository.getByEmail(userEmail);

    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    const token = await userService.generateToken(currentUser);

    await userRepository.setPasswordChangeToken(token, currentUser);

    await emailService.sendChangePasswordEmail(currentUser, token);
  },
  changePassword: async (
    command: UserChangePasswordCommand,
    currentUser: IUser
  ): Promise<void> => {
    const validOldPassword: boolean = await compare(
      command.oldPassword,
      currentUser.password
    );

    if (!validOldPassword) {
      throw new Error("Invalid old password");
    }

    const newPasswordHash: string = await userService.generatePasswordHash(
      command.newPassword
    );

    await userRepository.changePassword(newPasswordHash, currentUser);
  },
  forgotPasswordChangePassword: async (
    command: UserForgotPasswordChangePasswordCommand
  ): Promise<void> => {
    const currentUser: IUser = await userService.getByToken(command.token);

    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    if (command.token !== currentUser.passwordChangeToken) {
      throw new Error("Invalid or expired token");
    }

    const newPasswordHash: string = await userService.generatePasswordHash(
      command.newPassword
    );

    await userRepository.changePassword(newPasswordHash, currentUser);

    await userRepository.setPasswordChangeToken("", currentUser);
  },
  verifyfPasswordToken: async (token: string, currentUser: IUser) => {
    if (token !== currentUser.passwordChangeToken) {
      throw new Error("Token expired");
    }

    // @ts-ignore
    const secret: string = process.env.JWT_SECRET;

    try {
      verify(token, secret);
    } catch (_) {
      throw new Error("Token expired");
    }
  },
  createUser: async (command: UserCreateCommand): Promise<IUser> => {
    const user: IUser = await userRepository.create(command);

    return user;
  },
  getUsers: async (
    command: UsersGetCommand
  ): Promise<{ users: IUser[]; total: number }> => {
    const { users, total } = await userRepository.getUsers(command);

    return { users, total };
  },
  deleteUsers: async (usersIds: mongoose.ObjectId[]): Promise<void> => {
    await userRepository.deleteUsers(usersIds);
  },
};

export default userService;
