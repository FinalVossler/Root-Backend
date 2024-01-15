import express, { Response, Request } from "express";

import ResponseDto from "../../globalTypes/ResponseDto";
import userService from "./user.service";
import { IUser, IUserWithLastReadMessageInConversation } from "./user.model";
import protectMiddleware from "../../middleware/protectMiddleware";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import { IFile } from "../file/file.model";
import roleService from "../role/role.service";
import {
  IChatGetContactsCommand,
  IFileCommand,
  IUserChangePasswordCommand,
  IUserCreateCommand,
  IUserForgotPasswordChangePasswordCommand,
  IUserLoginCommand,
  IUserReadDto,
  IUserReadDtoWithLastReadMessageInConversationReadDto,
  IUserRegisterCommand,
  IUserSearchByRoleCommand,
  IUserUpdateCommand,
  IUsersGetCommand,
  IUsersSearchCommand,
  PermissionEnum,
  SuperRoleEnum,
} from "roottypes";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import {
  userToReadDto,
  userToReadDtoWithLastReadMessageInConversation,
} from "./user.toReadDto";

const router = express.Router();

router.post(
  "/getChatContacts",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IChatGetContactsCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IUserReadDto>>>
  ) => {
    const command: IChatGetContactsCommand = req.body;
    const { users, total } = await userService.chatGetContacts(
      command,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: {
        data: users.map(
          (user) => userToReadDto(user) as IUserReadDto as IUserReadDto
        ),
        total,
      },
    });
  }
);

router.post(
  "/getContactsByIds",
  async (
    req: ConnectedRequest<any, any, { usersIds: string[] }, any>,
    res: Response<ResponseDto<IUserReadDto[]>>
  ) => {
    const usersIds: string[] = req.body.usersIds;
    const users: IUser[] = await userService.getContactsByIds(usersIds);

    return res.status(200).json({
      success: true,
      data: users.map((u) => userToReadDto(u) as IUserReadDto),
    });
  }
);

router.get(
  "/getUser",
  async (
    req: ConnectedRequest<any, any, any, { userId: string }>,
    res: Response<ResponseDto<IUserReadDto>>
  ) => {
    const user: IUser = await userService.getById(req.query.userId);

    return res.status(200).json({
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    });
  }
);

router.post(
  "/getUsersWithTheirLastReadMessagesInConversation",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { usersIds: string[] }, any>,
    res: Response<
      ResponseDto<IUserReadDtoWithLastReadMessageInConversationReadDto[]>
    >
  ) => {
    const users: IUserWithLastReadMessageInConversation[] =
      await userService.getUsersWithTheirLastReadMessagesInConversation(
        req.body.usersIds
      );

    return res.status(200).json({
      success: true,
      data: users.map((u) => userToReadDtoWithLastReadMessageInConversation(u)),
    });
  }
);

router.get(
  "/me",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<IUserReadDto>>
  ) => {
    const user: IUser | undefined = req.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    return res.status(200).json({
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    });
  }
);

router.post(
  "/register",
  async (
    req: Request<
      any,
      ResponseDto<{ token: string; expiresIn: string; user: IUserReadDto }>,
      IUserRegisterCommand
    >,
    res: Response<
      ResponseDto<{ token: string; expiresIn: string; user: IUserReadDto }>
    >
  ) => {
    const { token, user } = await userService.register(req.body);

    return res.status(200).json({
      success: true,
      data: {
        token,
        // @ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN,
        user: userToReadDto(user) as IUserReadDto,
      },
    });
  }
);

router.post(
  "/login",
  async (
    req: Request<any, any, IUserLoginCommand>,
    res: Response<
      ResponseDto<{ token: string; expiresIn: string; user: IUserReadDto }>
    >
  ) => {
    var { user, token } = await userService.login(req.body);

    return res.status(200).json({
      success: true,
      data: {
        token,
        //@ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN,
        user: userToReadDto(user) as IUserReadDto,
      },
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IUserUpdateCommand, any>,
    res: Response<ResponseDto<IUserReadDto>>
  ) => {
    const command: IUserUpdateCommand = req.body;
    const user: IUser = req.user;
    if (user._id.toString() !== command._id.toString()) {
      roleService.checkPermission({
        user,
        permission: PermissionEnum.UpdateUser,
      });
    }

    if (
      user.superRole !== SuperRoleEnum.SuperAdmin &&
      command.superRole === SuperRoleEnum.SuperAdmin
    ) {
      throw new Error(
        "Trying to set another user as a super admin while you aren't super admin yourself"
      );
    }

    const updatedUser: IUser = await userService.update(command);

    return res.status(200).json({
      success: true,
      data: userToReadDto(updatedUser) as IUserReadDto,
    });
  }
);

router.put(
  "/updateProfilePicture",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IFile, any>,
    res: Response<ResponseDto<IUserReadDto>>
  ) => {
    let user: IUser = req.user;
    const profilePicture: IFile = req.body;

    user = await userService.updateProfilePictre(
      {
        userId: user._id.toString(),
        picture: profilePicture as IFileCommand,
      },
      req.user
    );

    return res.status(200).json({
      success: true,
      data: userToReadDto(user) as IUserReadDto,
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
      IUserChangePasswordCommand,
      any
    >,
    res: Response<ResponseDto<void>>
  ) => {
    const command: IUserChangePasswordCommand = req.body;

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
      IUserForgotPasswordChangePasswordCommand,
      any
    >,
    res: Response<ResponseDto<void>>
  ) => {
    const command: IUserForgotPasswordChangePasswordCommand = req.body;

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
    req: ConnectedRequest<any, any, IUserCreateCommand, any>,
    res: Response<ResponseDto<IUserReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateUser,
    });

    const command: IUserCreateCommand = req.body;

    if (
      req.user.superRole !== SuperRoleEnum.SuperAdmin &&
      command.superRole === SuperRoleEnum.SuperAdmin
    ) {
      throw new Error(
        "Trying to set another user as a super admin while you aren't super admin yourself"
      );
    }

    const user: IUser = await userService.createUser(command);

    return res.status(200).send({
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    });
  }
);

router.post(
  "/getUsers",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IUsersGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IUserReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.ReadUser,
    });

    const command: IUsersGetCommand = req.body;
    const { users, total } = await userService.getUsers(command);

    return res.status(200).send({
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeleteUser,
    });

    const usersIds: string[] = req.body;
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
    req: ConnectedRequest<any, any, IUsersSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IUserReadDto>>>
  ) => {
    const command: IUsersSearchCommand = req.body;

    const { users, total } = await userService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    });
  }
);

router.post(
  "/searchByRole",
  async (
    req: ConnectedRequest<any, any, IUserSearchByRoleCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IUserReadDto>>>
  ) => {
    const command: IUserSearchByRoleCommand = req.body;

    const { users, total } = await userService.searchByRole(command);

    return res.status(200).send({
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    });
  }
);

export default router;
