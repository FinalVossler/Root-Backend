import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IPost } from "./post.model";
import postService from "./post.service";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import { IUser } from "../user/user.model";
import {
  IPostCreateCommand,
  IPostReadDto,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";
import { postToReadDto } from "./post.toReadDto";

const postController = {
  createPost: async (
    req: ConnectedRequest<any, any, IPostCreateCommand, any>,
    res: Response<ResponseDto<IPostReadDto>>
  ) => {
    const command: IPostCreateCommand = req.body;
    const post: IPost = await postService.create(command, req.user);

    return res.status(200).send({
      success: true,
      data: postToReadDto(post) as IPostReadDto,
    });
  },
  getUserPosts: async (
    req: ConnectedRequest<any, any, IPostsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IPostReadDto>>>
  ) => {
    const command: IPostsGetCommand = req.body;
    const { posts, total } = await postService.getUserPosts(command, req.user);

    return res.status(200).send({
      success: true,
      data: {
        data: posts.map((p) => postToReadDto(p) as IPostReadDto),
        total,
      },
    });
  },
  searchPosts: async (
    req: ConnectedRequest<any, any, IPostsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IPostReadDto>>>
  ) => {
    const command: IPostsSearchCommand = req.body;

    const { posts, total } = await postService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: posts.map((p) => postToReadDto(p) as IPostReadDto),
        total,
      },
    });
  },
  updatePost: async (
    req: ConnectedRequest<any, any, IPostUpdateCommand, any>,
    res: Response<ResponseDto<IPostReadDto>>
  ) => {
    const command: IPostUpdateCommand = req.body;

    const post: IPost = await postService.update(command, req.user);

    return res.status(200).json({
      data: postToReadDto(post) as IPostReadDto,
      success: true,
    });
  },
  deletePost: async (
    req: ConnectedRequest<any, any, any, { postId: string }>,
    res: Response<ResponseDto<void>>
  ) => {
    const postId: string = req.query.postId;
    const user: IUser = req.user;

    await postService.delete(postId, user);

    return res.status(200).json({
      success: true,
      data: null,
    });
  },
};

export default postController;
