import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationCommand from "../../globalTypes/PaginationCommand";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import PostCreateCommand from "./dto/PostCreateCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import PostReadDto, { toReadDto } from "./dto/PostReadDto";
import { IPost } from "./post.model";
import postService from "./post.service";
import PaginationResponse from "../../globalTypes/PaginationResponse";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, PostCreateCommand, any>,
    res: Response<ResponseDto<PostReadDto>>
  ) => {
    const command: PostCreateCommand = req.body;
    const post: IPost = await postService.createPost(command);

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

export default router;
