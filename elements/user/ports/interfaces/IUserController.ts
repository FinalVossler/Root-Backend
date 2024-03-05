import {
  IChatGetContactsCommand,
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
} from "roottypes";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IRequest from "../../../../globalTypes/IRequest";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IUser from "./IUser";
import { IFile } from "../../../file/file.model";

type IUserController = {
  getChatContacts: (
    req: IRequest<IChatGetContactsCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IUserReadDto>>>;
  getContactsById: (
    req: IRequest<{ usersIds: string[] }, any>,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto[]>>;
  getUser: (
    req: IRequest<any, any, { userId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto>>;
  getUsersWithTheirLastReadMessagesInConversation: (
    req: IRequest<{ usersIds: string[] }>,
    currentUser: IUser
  ) => Promise<
    IResponseDto<IUserReadDtoWithLastReadMessageInConversationReadDto[]>
  >;
  me: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto>>;
  register: (
    req: IRequest<IUserRegisterCommand>,
    currentUser: IUser
  ) => Promise<
    IResponseDto<{ token: string; expiresIn: string; user: IUserReadDto }>
  >;
  login: (
    req: IRequest<IUserLoginCommand>,
    currentUser: IUser
  ) => Promise<
    IResponseDto<{ token: string; expiresIn: string; user: IUserReadDto }>
  >;
  updateUser: (
    req: IRequest<IUserUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto>>;
  updateProfilePicture: (
    req: IRequest<IFile>,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto>>;
  sendChangePasswordRequest: (
    req: IRequest<{ email: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  changePassword: (
    req: IRequest<IUserChangePasswordCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  forgotPasswordChangePassword: (
    req: IRequest<IUserForgotPasswordChangePasswordCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  verifyPasswordToken: (
    req: IRequest<string>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  createUser: (
    req: IRequest<IUserCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IUserReadDto>>;
  getUsers: (
    req: IRequest<IUsersGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IUserReadDto>>>;
  deleteUsers: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchUsers: (
    req: IRequest<IUsersSearchCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IUserReadDto>>>;
  searchUsersByRole: (
    req: IRequest<IUserSearchByRoleCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IUserReadDto>>>;
};

export default IUserController;
