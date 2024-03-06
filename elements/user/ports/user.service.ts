import { decode, sign, verify } from "jsonwebtoken";
import { compare, genSalt, hash } from "bcrypt";

import {
  IChatGetContactsCommand,
  IUserChangePasswordCommand,
  IUserCreateCommand,
  IUserForgotPasswordChangePasswordCommand,
  IUserLoginCommand,
  IUserRegisterCommand,
  IUserSearchByRoleCommand,
  IUserUpdateCommand,
  IUserUpdateProfilePictureCommand,
  IUsersGetCommand,
  IUsersSearchCommand,
  PermissionEnum,
  SuperRoleEnum,
} from "roottypes";

import IUser, {
  IUserWithLastReadMessageInConversation,
} from "./interfaces/IUser";
import IUserService from "./interfaces/IUserService";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IUserRepository from "./interfaces/IUserRepository";
import IMessage from "../../message/ports/interfaces/IMessage";
import IMessageService from "../../message/ports/interfaces/IMessageService";
import IEmailService from "../../email/ports/interfaces/IEmailService";

const createUserService = (
  roleService: IRoleService,
  userRepository: IUserRepository,
  messageService: IMessageService,
  emailService: IEmailService
): IUserService => ({
  generatePasswordHash: async function (password: string): Promise<string> {
    const salt: string = await genSalt(10);

    const passwordHash: string = await hash(password, salt);

    return passwordHash;
  },
  chatGetContacts: async function (
    command: IChatGetContactsCommand,
    currentUser: IUser
  ): Promise<{ users: IUser[]; total: number }> {
    const { users, total } = await userRepository.chatGetContacts(
      command,
      currentUser
    );

    return { users, total };
  },
  getById: async function (userId: string): Promise<IUser> {
    const user: IUser = await userRepository.getById(userId);

    return user;
  },
  getContactsByIds: async function (usersIds: string[]): Promise<IUser[]> {
    const users: IUser[] = await userRepository.getContactsByIds(usersIds);

    return users;
  },
  register: async function (
    command: IUserRegisterCommand
  ): Promise<{ user: IUser; token: string }> {
    const user: IUser = await userRepository.save(command);

    const token: string = this.generateToken(user);

    return { token, user };
  },
  login: async function (
    command: IUserLoginCommand
  ): Promise<{ token: string; user: IUser }> {
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

    const token: string = this.generateToken(user);

    return { token, user };
  },
  updateUser: async function (
    command: IUserUpdateCommand,
    currentUser: IUser
  ): Promise<IUser> {
    if (currentUser._id.toString() !== command._id.toString()) {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.UpdateUser,
      });
    }

    if (
      currentUser.superRole !== SuperRoleEnum.SuperAdmin &&
      command.superRole === SuperRoleEnum.SuperAdmin
    ) {
      throw new Error(
        "Trying to set another user as a super admin while you aren't super admin yourself"
      );
    }

    const user: IUser = await userRepository.update(command);

    return user;
  },
  updateProfilePictre: async function (
    command: IUserUpdateProfilePictureCommand,
    currentUser: IUser
  ): Promise<IUser> {
    const user: IUser = await userRepository.updateProfilePicture(
      command,
      currentUser
    );

    return user;
  },
  getByToken: async function (token: string): Promise<IUser> {
    const signedUser: { _id: string } = decode(token) as IUser;

    const user: IUser = await userRepository.getById(signedUser._id.toString());

    return user;
  },
  generateToken: function (user: IUser): string {
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
  sendChangePasswordEmail: async function (userEmail: string) {
    const currentUser: IUser = await userRepository.getByEmail(userEmail);

    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    const token = await this.generateToken(currentUser);

    await userRepository.setPasswordChangeToken(token, currentUser);

    await emailService.sendChangePasswordEmail(currentUser, token);
  },
  changePassword: async function (
    command: IUserChangePasswordCommand,
    currentUser: IUser
  ): Promise<void> {
    const validOldPassword: boolean = await compare(
      command.oldPassword,
      currentUser.password
    );

    if (!validOldPassword) {
      throw new Error("Invalid old password");
    }

    const newPasswordHash: string = await this.generatePasswordHash(
      command.newPassword
    );

    await userRepository.changePassword(newPasswordHash, currentUser);
  },
  forgotPasswordChangePassword: async function (
    command: IUserForgotPasswordChangePasswordCommand
  ): Promise<void> {
    const currentUser: IUser = await this.getByToken(command.token);

    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    if (command.token !== currentUser.passwordChangeToken) {
      throw new Error("Invalid or expired token");
    }

    const newPasswordHash: string = await this.generatePasswordHash(
      command.newPassword
    );

    await userRepository.changePassword(newPasswordHash, currentUser);

    await userRepository.setPasswordChangeToken("", currentUser);
  },
  verifyfPasswordToken: async function (token: string, currentUser: IUser) {
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
  createUser: async (
    command: IUserCreateCommand,
    currentUser: IUser
  ): Promise<IUser> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateUser,
    });

    const user: IUser = await userRepository.create(command);

    return user;
  },
  getUsers: async function (
    command: IUsersGetCommand,
    currentUser: IUser
  ): Promise<{ users: IUser[]; total: number }> {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.ReadUser,
    });
    const { users, total } = await userRepository.getUsers(command);

    return { users, total };
  },
  getByIds: async function (ids: string[]): Promise<IUser[]> {
    const users: IUser[] = await userRepository.getByIds(ids);

    return users;
  },
  getUsersWithTheirLastReadMessagesInConversation: async function (
    usersIds: string[]
  ): Promise<IUserWithLastReadMessageInConversation[]> {
    const usersIdsArray = typeof usersIds === "string" ? [usersIds] : usersIds;
    const users: IUser[] = await userRepository.getByIds(usersIdsArray);

    const promises: Promise<IMessage | null>[] = [];

    const usersWithLastReadMessageInConversation: IUserWithLastReadMessageInConversation[] =
      [];

    users.forEach((user) => {
      promises.push(
        new Promise<IMessage | null>(async (resolve, reject) => {
          const userLastReadMessageInConversation: IMessage | null =
            await messageService.getUserLastReadMessageInConversation({
              to: usersIdsArray,
              userId: user._id.toString(),
            });
          usersWithLastReadMessageInConversation.push({
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            _id: user._id,
            email: user.email,
            password: user.password,
            passwordChangeToken: user.passwordChangeToken,
            superRole: user.superRole,
            role: user.role,
            lastReadMessageInConversation: userLastReadMessageInConversation,
            to: usersIdsArray,
          });

          resolve(userLastReadMessageInConversation);
        })
      );
    });

    await Promise.all(promises);

    return usersWithLastReadMessageInConversation;
  },
  deleteUsers: async function (
    usersIds: string[],
    currentUser: IUser
  ): Promise<void> {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteUser,
    });

    await userRepository.deleteUsers(usersIds);
  },
  search: async function (
    command: IUsersSearchCommand
  ): Promise<{ users: IUser[]; total: number }> {
    const { users, total } = await userRepository.search(command, {});

    return { users, total };
  },
  getRoleUsers: async function (roleId: string): Promise<IUser[]> {
    return await userRepository.getRoleUsers(roleId);
  },
  searchByRole: async function (
    command: IUserSearchByRoleCommand
  ): Promise<{ users: IUser[]; total: number }> {
    const { users, total } = await userRepository.searchByRole(command);

    return { users, total };
  },
});

export default createUserService;
