import express, { Response, Request } from "express";

import ResponseDto from "../../globalTypes/ResponseDto";
import UserLoginCommand from "./dtos/UserLoginCommand";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import userService from "./user.service";
import UserReadDto, { toReadDto } from "./dtos/UserReadDto";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import { IUser } from "./user.model";
import protectMiddleware from "../../middleware/protectMiddleware";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";

const router = express.Router();

router.get(
  "/",
  protectMiddleware,
  async (req: ConnectedRequest, res: Response<ResponseDto<UserReadDto[]>>) => {
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
  async (req: ConnectedRequest, res: Response<ResponseDto<UserReadDto>>) => {
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
  async (
    req: Request<any, any, UserUpdateCommand>,
    res: Response<ResponseDto<UserReadDto>>
  ) => {
    const user: IUser = await userService.update(req.body);

    return res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export default router;
