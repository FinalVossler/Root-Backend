import { Router, Response, json } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import PostCreateCommand from "./dto/PostCreateCommand";
import PostReadDto, { toReadDto } from "./dto/PostReadDto";
import { IPost } from "./post.model";
import postService from "./post.service";

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

export default router;
