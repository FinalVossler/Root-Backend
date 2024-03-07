import {
  IChatGetContactsCommand,
  IFileCommand,
  IUserChangePasswordCommand,
  IUserCreateCommand,
  IUserForgotPasswordChangePasswordCommand,
  IUserLoginCommand,
  IUserReadDto,
  IUserRegisterCommand,
  IUserSearchByRoleCommand,
  IUserUpdateCommand,
  IUsersGetCommand,
  IUsersSearchCommand,
  SuperRoleEnum,
} from "roottypes";

import {
  userToReadDto,
  userToReadDtoWithLastReadMessageInConversation,
} from "./user.toReadDto";
import IUserService from "./interfaces/IUserService";
import IUser, {
  IUserWithLastReadMessageInConversation,
} from "./interfaces/IUser";
import IUserController from "./interfaces/IUserController";
import IRequest from "../../../globalTypes/IRequest";
import IFile from "../../file/ports/interfaces/IFile";

const createUserController = (userService: IUserService): IUserController => ({
  getChatContacts: async (
    req: IRequest<IChatGetContactsCommand>,
    currentUser: IUser
  ) => {
    const { users, total } = await userService.chatGetContacts(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: users.map(
          (user) => userToReadDto(user) as IUserReadDto as IUserReadDto
        ),
        total,
      },
    };
  },
  getContactsById: async (
    req: IRequest<{ usersIds: string[] }>,
    currentUser: IUser
  ) => {
    const users: IUser[] = await userService.getContactsByIds(
      req.body.usersIds
    );

    return {
      success: true,
      data: users.map((u) => userToReadDto(u) as IUserReadDto),
    };
  },
  getUser: async (
    req: IRequest<any, any, { userId: string }>,
    currentUser: IUser
  ) => {
    const user: IUser = await userService.getById(req.query.userId);

    return {
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    };
  },
  getUsersWithTheirLastReadMessagesInConversation: async (
    req: IRequest<{ usersIds: string[] }>,
    currentUser: IUser
  ) => {
    const users: IUserWithLastReadMessageInConversation[] =
      await userService.getUsersWithTheirLastReadMessagesInConversation(
        req.body.usersIds
      );

    return {
      success: true,
      data: users.map((u) => userToReadDtoWithLastReadMessageInConversation(u)),
    };
  },
  me: async (req: IRequest, currentUser: IUser) => {
    const user: IUser | undefined = currentUser;

    if (!user) {
      throw new Error("Unauthorized");
    }

    return {
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    };
  },
  register: async (req: IRequest<IUserRegisterCommand>) => {
    const { token, user } = await userService.register(req.body);

    return {
      success: true,
      data: {
        token,
        // @ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN as string,
        user: userToReadDto(user) as IUserReadDto,
      },
    };
  },
  login: async (req: IRequest<IUserLoginCommand>, currentUser: IUser) => {
    var { user, token } = await userService.login(req.body);

    return {
      success: true,
      data: {
        token,
        //@ts-ignore
        expiresIn: process.env.TOKEN_EXPIRES_IN as strng,
        user: userToReadDto(user) as IUserReadDto,
      },
    };
  },
  updateUser: async (req: IRequest<IUserUpdateCommand>, currentUser: IUser) => {
    const updatedUser: IUser = await userService.updateUser(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: userToReadDto(updatedUser) as IUserReadDto,
    };
  },
  updateProfilePicture: async (req: IRequest<IFile>, currentUser: IUser) => {
    const profilePicture: IFile = req.body;

    const user = await userService.updateProfilePictre(
      {
        userId: currentUser._id.toString(),
        picture: profilePicture as IFileCommand,
      },
      currentUser
    );

    return {
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    };
  },
  sendChangePasswordRequest: async (
    req: IRequest<{ email: string }, any>,
    currentUser: IUser
  ) => {
    const userEmail: string = req.body.email;

    await userService.sendChangePasswordEmail(userEmail);

    return {
      success: true,
      data: null,
    };
  },
  changePassword: async (
    req: IRequest<IUserChangePasswordCommand>,
    currentUser: IUser
  ) => {
    const command: IUserChangePasswordCommand = req.body;

    await userService.changePassword(command, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  forgotPasswordChangePassword: async (
    req: IRequest<IUserForgotPasswordChangePasswordCommand>,
    currentUser: IUser
  ) => {
    const command: IUserForgotPasswordChangePasswordCommand = req.body;

    await userService.forgotPasswordChangePassword(command);

    return {
      success: true,
      data: null,
    };
  },
  verifyPasswordToken: async (req: IRequest<string>, currentUser: IUser) => {
    const passwordToken: string = req.body;

    await userService.verifyfPasswordToken(passwordToken, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  createUser: async (req: IRequest<IUserCreateCommand>, currentUser: IUser) => {
    const command: IUserCreateCommand = req.body;

    if (
      currentUser.superRole !== SuperRoleEnum.SuperAdmin &&
      command.superRole === SuperRoleEnum.SuperAdmin
    ) {
      throw new Error(
        "Trying to set another user as a super admin while you aren't super admin yourself"
      );
    }

    const user: IUser = await userService.createUser(command, currentUser);

    return {
      success: true,
      data: userToReadDto(user) as IUserReadDto,
    };
  },
  getUsers: async (req: IRequest<IUsersGetCommand>, currentUser: IUser) => {
    const command: IUsersGetCommand = req.body;
    const { users, total } = await userService.getUsers(command, currentUser);

    return {
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    };
  },
  deleteUsers: async (req: IRequest<string[]>, currentUser: IUser) => {
    const usersIds: string[] = req.body;
    await userService.deleteUsers(usersIds, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  searchUsers: async (
    req: IRequest<IUsersSearchCommand>,
    currentUser: IUser
  ) => {
    const command: IUsersSearchCommand = req.body;

    const { users, total } = await userService.search(command);

    return {
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    };
  },
  searchUsersByRole: async (
    req: IRequest<IUserSearchByRoleCommand>,
    currentUser: IUser
  ) => {
    const command: IUserSearchByRoleCommand = req.body;

    const { users, total } = await userService.searchByRole(command);

    return {
      success: true,
      data: {
        data: users.map((p) => userToReadDto(p) as IUserReadDto),
        total,
      },
    };
  },
});

export default createUserController;
