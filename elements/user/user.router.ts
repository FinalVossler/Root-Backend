import express, { Response, Request, json } from "express";

import ResponseDto from "../../globalTypes/ResponseDto";
import UserLoginCommand from "./dtos/UserLoginCommand";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import userService from "./user.service";
import UserReadDto, { toReadDto } from "./dtos/UserReadDto";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import { IUser, Role } from "./user.model";
import protectMiddleware from "../../middleware/protectMiddleware";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import { IFile } from "../file/file.model";

const router = express.Router();

router.get(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<UserReadDto[]>>
  ) => {
    const users: IUser[] = await userService.get(req.user?._id);

    return res.status(200).json({
      success: true,
      data: users.map((user) => toReadDto(user)),
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
      throw new Error("Unauthorized to update user");
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
  "/sendChangePasswordEmail",
  protectMiddleware,
  async (
    req: ConnectedRequest<
      any,
      ResponseDto<{ token: string; expiresIn: string; user: UserReadDto }>,
      UserRegisterCommand,
      any
    >,
    res: Response<ResponseDto<void>>
  ) => {
    await userService.sendChangePasswordEmail(req.user);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

export default router;
