import {
  IPostCreateCommand,
  IPostReadDto,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";

import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IRequest from "../../../../globalTypes/IRequest";
import IUser from "../../../user/ports/interfaces/IUser";

type IPostController = {
  createPost: (
    req: IRequest<IPostCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPostReadDto>>;
  getUserPosts: (
    req: IRequest<IPostsGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IPostReadDto>>>;
  searchPosts: (
    req: IRequest<IPostsSearchCommand>
  ) => Promise<IResponseDto<IPaginationResponse<IPostReadDto>>>;
  updatePost: (
    req: IRequest<IPostUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPostReadDto>>;
  deletePost: (
    req: IRequest<any, any, { postId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
};

export default IPostController;
