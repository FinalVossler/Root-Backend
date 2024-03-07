import {
  IPostCreateCommand,
  IPostReadDto,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";

import { postToReadDto } from "./post.toReadDto";
import IPost from "./interfaces/IPost";
import IUser from "../../user/ports/interfaces/IUser";
import IPostController from "./interfaces/IPostController";
import IRequest from "../../../globalTypes/IRequest";
import IPostService from "./interfaces/IPostService";

const createPostController = (postService: IPostService): IPostController => ({
  createPost: async (req: IRequest<IPostCreateCommand>, currentUser: IUser) => {
    const post: IPost = await postService.create(req.body, currentUser);

    return {
      success: true,
      data: postToReadDto(post) as IPostReadDto,
    };
  },
  getUserPosts: async (req: IRequest<IPostsGetCommand>, currentUser: IUser) => {
    const { posts, total } = await postService.getUserPosts(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: posts.map((p) => postToReadDto(p) as IPostReadDto),
        total,
      },
    };
  },
  searchPosts: async (req: IRequest<IPostsSearchCommand>) => {
    const { posts, total } = await postService.search(req.body);

    return {
      success: true,
      data: {
        data: posts.map((p) => postToReadDto(p) as IPostReadDto),
        total,
      },
    };
  },
  updatePost: async (req: IRequest<IPostUpdateCommand>, currentUser: IUser) => {
    const command: IPostUpdateCommand = req.body;

    const post: IPost = await postService.update(command, currentUser);

    return {
      data: postToReadDto(post) as IPostReadDto,
      success: true,
    };
  },
  deletePost: async (
    req: IRequest<any, any, { postId: string }>,
    currentUser: IUser
  ) => {
    await postService.delete(req.query.postId, currentUser);

    return {
      success: true,
      data: null,
    };
  },
});

export default createPostController;
