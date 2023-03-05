import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import PostCreateCommand from "./dto/PostCreateCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import PostReadDto, { toReadDto } from "./dto/PostReadDto";
import { IPost } from "./post.model";
import postService from "./post.service";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import { IUser } from "../user/user.model";
import PostUpdateCommand from "./dto/PostUpdateCommand";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, PostCreateCommand, any>,
    res: Response<ResponseDto<PostReadDto>>
  ) => {
    const command: PostCreateCommand = req.body;
    const post: IPost = await postService.create(command, req.user);

    return res.status(200).send({
      success: true,
      data: toReadDto(post),
    });
  }
);

router.post(
  "/getUserPosts",
  async (
    req: ConnectedRequest<any, any, PostsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<PostReadDto>>>
  ) => {
    const command: PostsGetCommand = req.body;
    const { posts, total } = await postService.getUserPosts(command);

    return res.status(200).send({
      success: true,
      data: {
        data: posts.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.post(
  "/search",
  async (
    req: ConnectedRequest<any, any, PostsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<PostReadDto>>>
  ) => {
    const command: PostsSearchCommand = req.body;

    const { posts, total } = await postService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: posts.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, PostUpdateCommand, any>,
    res: Response<ResponseDto<PostReadDto>>
  ) => {
    const command: PostUpdateCommand = req.body;

    const post: IPost = await postService.update(command, req.user);

    return res.status(200).json({
      data: toReadDto(post),
      success: true,
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
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
  }
);

export default router;
