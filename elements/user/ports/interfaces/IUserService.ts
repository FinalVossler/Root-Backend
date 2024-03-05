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
} from "roottypes";
import IUser from "./IUser";
import { IUserWithLastReadMessageInConversation } from "../../adapters/user.mongoose.model";

export default interface IUserService {
  generatePasswordHash: (password: string) => Promise<string>;
  chatGetContacts: (
    command: IChatGetContactsCommand,
    currentUser: IUser
  ) => Promise<{ users: IUser[]; total: number }>;
  getById: (userId: string) => Promise<IUser>;
  getContactsByIds: (usersIds: string[]) => Promise<IUser[]>;
  register: (
    command: IUserRegisterCommand
  ) => Promise<{ user: IUser; token: string }>;
  login: (
    command: IUserLoginCommand
  ) => Promise<{ token: string; user: IUser }>;
  updateUser: (
    command: IUserUpdateCommand,
    currentUser: IUser
  ) => Promise<IUser>;
  updateProfilePictre: (
    command: IUserUpdateProfilePictureCommand,
    currentUser: IUser
  ) => Promise<IUser>;
  getByToken: (token: string) => Promise<IUser>;
  generateToken: (user: IUser) => string;
  sendChangePasswordEmail: (userEmail: string) => void;
  changePassword: (
    command: IUserChangePasswordCommand,
    currentUser: IUser
  ) => Promise<void>;
  forgotPasswordChangePassword: (
    command: IUserForgotPasswordChangePasswordCommand
  ) => Promise<void>;
  verifyfPasswordToken: (token: string, currentUser: IUser) => void;
  createUser: (
    command: IUserCreateCommand,
    currentUser: IUser
  ) => Promise<IUser>;
  getUsers: (
    command: IUsersGetCommand,
    currentUser: IUser
  ) => Promise<{ users: IUser[]; total: number }>;
  getByIds: (ids: string[]) => Promise<IUser[]>;
  getUsersWithTheirLastReadMessagesInConversation: (
    usersIds: string[]
  ) => Promise<IUserWithLastReadMessageInConversation[]>;
  deleteUsers: (usersIds: string[], currentUser: IUser) => Promise<void>;
  search: (
    command: IUsersSearchCommand
  ) => Promise<{ users: IUser[]; total: number }>;
  getRoleUsers: (roleId: string) => Promise<IUser[]>;
  searchByRole: (
    command: IUserSearchByRoleCommand
  ) => Promise<{ users: IUser[]; total: number }>;
}
