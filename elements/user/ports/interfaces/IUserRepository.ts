import {
  IChatGetContactsCommand,
  IUserCreateCommand,
  IUserRegisterCommand,
  IUserSearchByRoleCommand,
  IUserUpdateCommand,
  IUserUpdateProfilePictureCommand,
  IUsersGetCommand,
  IUsersSearchCommand,
} from "roottypes";
import IUser from "./IUser";

export default interface IUserRepository {
  chatGetContacts: (
    command: IChatGetContactsCommand,
    currentUser: IUser
  ) => Promise<{ users: IUser[]; total: number }>;
  save: (command: IUserRegisterCommand) => Promise<IUser>;
  getById: (id: string) => Promise<IUser>;
  getContactsByIds: (usersIds: string[]) => Promise<IUser[]>;
  getByEmail: (email: string) => Promise<IUser>;
  deleteByEmail: (email: string) => Promise<void>;
  update: (command: IUserUpdateCommand) => Promise<IUser>;
  updateProfilePicture: (
    command: IUserUpdateProfilePictureCommand,
    currentUser: IUser
  ) => Promise<IUser>;
  setPasswordChangeToken: (token: string, currentUser: IUser) => Promise<void>;
  changePassword: (
    newPasswordHash: string,
    currentUser: IUser
  ) => Promise<void>;
  create: (command: IUserCreateCommand) => Promise<IUser>;
  getUsers: (
    command: IUsersGetCommand
  ) => Promise<{ total: number; users: IUser[] }>;
  getByIds: (usersIds: string[]) => Promise<IUser[]>;
  deleteUsers: (usersIds: string[]) => Promise<void>;
  search: (
    command: IUsersSearchCommand,
    additionalConditions: any
  ) => Promise<{ users: IUser[]; total: number }>;
  getRoleUsers: (roleId: string) => Promise<IUser[]>;
  searchByRole: (
    command: IUserSearchByRoleCommand
  ) => Promise<{ users: IUser[]; total: number }>;
}
