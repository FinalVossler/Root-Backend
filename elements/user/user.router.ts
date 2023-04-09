import express, { Response, Request } from "express";
import mongoose from "mongoose";

import ResponseDto from "../../globalTypes/ResponseDto";
import UserLoginCommand from "./dtos/UserLoginCommand";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import userService from "./user.service";
import UserReadDto, { toReadDto } from "./dtos/UserReadDto";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import { IUser } from "./user.model";
import protectMiddleware from "../../middleware/protectMiddleware";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import { IFile } from "../file/file.model";
import UserChangePasswordCommand from "./dtos/UserChangePasswordCommand";
import UserForgotPasswordChangePasswordCommand from "./dtos/UserForgotPasswordChangePasswordCommand";
import UserCreateCommand from "./dtos/UserCreateCommand";
import UsersGetCommand from "./dtos/UsersGetCommand";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import UsersSearchCommand from "./dtos/UsersSearchCommand";
import ChatGetContactsCommand from "./dtos/ChatGetContactsCommand";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";

const router = express.Router();

router.post(
  "/getChatContacts",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, ChatGetContactsCommand, any>,
    res: Response<ResponseDto<PaginationResponse<UserReadDto>>>
  ) => {
    const command: ChatGetContactsCommand = req.body;
    const { users, total } = await userService.chatGetContacts(
      command,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: {
        data: users.map((user) => toReadDto(user)),
        total,
      },
    });
  }
);

router.get(
  "/getContactsById",
  async (
    req: ConnectedRequest<any, any, any, { usersIds: string }>,
    res: Response<ResponseDto<UserReadDto[]>>
  ) => {
    const usersIds: string[] = req.query.usersIds.split(",");
    const users: IUser[] = await userService.getContactsById(usersIds);

    return res.status(200).json({
      success: true,
      data: users.map((u) => toReadDto(u)),
    });
  }
);

router.get(
  "/getUser",
  async (
    req: ConnectedRequest<any, any, any, { userId: string }>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    const user: IUser = await userService.getById(req.query.userId);

    return res.status(200).json({
      success: true,
      data: toReadDto(user),
    });
  }
);

router.get(
  "/me",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    const user: IUser | undefined = req.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    return res.status(200).json({
      success: true,
      data: toReadDto(user),
    });
  }
);

router.post(
  "/register",
  async (
    req: Request<
      any,
      ResponseDto<{ token: string; expiresIn: string; user: UserReadDto }>,
      UserRegisterCommand
    >,
    res: Response<
      ResponseDto<{ token: string; expiresIn: string; user: UserReadDto }>
    >
  ) => {
    const { token, user } = await userService.register(req.body);

    return res.status(200).json({
      success: true,
      data: {
        token,
        // @ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN,
        user: toReadDto(user),
      },
    });
  }
);

router.post(
  "/login",
  async (
    req: Request<any, any, UserLoginCommand>,
    res: Response<
      ResponseDto<{ token: string; expiresIn: string; user: UserReadDto }>
    >
  ) => {
    var { user, token } = await userService.login(req.body);

    return res.status(200).json({
      success: true,
      data: {
        token,
        //@ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN,
        user: toReadDto(user),
      },
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, UserUpdateCommand, any>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    const command: UserUpdateCommand = req.body;
    const user: IUser = req.user;
    if (user._id.toString() !== command._id.toString()) {
      roleService.checkPermission({ user, permission: Permission.UpdateUser });
    }

    const updatedUser: IUser = await userService.update(command);

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  }
);

router.put(
  "/updateProfilePicture",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IFile, any>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    let user: IUser = req.user;
    const profilePicture: IFile = req.body;

    user = await userService.updateProfilePictre(
      {
        userId: user._id,
        picture: profilePicture,
      },
      req.user
    );

    return res.status(200).json({
      success: true,
      data: toReadDto(user),
    });
  }
);

router.post(
  "/sendChangePasswordRequest",
  async (
    req: Request<any, ResponseDto<void>, { email }, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const userEmail: string = req.body.email;

    await userService.sendChangePasswordEmail(userEmail);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/changePassword",
  protectMiddleware,
  async (
    req: ConnectedRequest<
      any,
      ResponseDto<void>,
      UserChangePasswordCommand,
      any
    >,
    res: Response<ResponseDto<void>>
  ) => {
    const command: UserChangePasswordCommand = req.body;

    await userService.changePassword(command, req.user);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/forgotPasswordChangePassword",
  async (
    req: Request<
      any,
      ResponseDto<void>,
      UserForgotPasswordChangePasswordCommand,
      any
    >,
    res: Response<ResponseDto<void>>
  ) => {
    const command: UserForgotPasswordChangePasswordCommand = req.body;

    await userService.forgotPasswordChangePassword(command);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/verifyPasswordToken",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, ResponseDto<void>, string, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const passwordToken: string = req.body;

    await userService.verifyfPasswordToken(passwordToken, req.user);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, UserCreateCommand, any>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateUser,
    });

    const command: UserCreateCommand = req.body;
    const user: IUser = await userService.createUser(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(user),
    });
  }
);

router.post(
  "/getUsers",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, UsersGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<UserReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadUser,
    });

    const command: UsersGetCommand = req.body;
    const { users, total } = await userService.getUsers(command);

    return res.status(200).send({
      success: true,
      data: {
        data: users.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeleteUser,
    });

    const usersIds: mongoose.ObjectId[] = req.body;
    await userService.deleteUsers(usersIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/search",
  async (
    req: ConnectedRequest<any, any, UsersSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<UserReadDto>>>
  ) => {
    const command: UsersSearchCommand = req.body;

    const { users, total } = await userService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: users.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

export default router;
