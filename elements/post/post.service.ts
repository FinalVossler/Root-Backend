import mongoose from "mongoose";

import PostCreateCommand from "./dto/PostCreateCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import { IPost } from "./post.model";
import postRepository from "./post.repository";

const postService = {
  createPost: async (command: PostCreateCommand): Promise<IPost> => {
    const post: IPost = await postRepository.createPost(command);

    return post;
  },
  getUserPosts: async (
    command: PostsGetCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.getUserPosts(command);

    return { posts, total };
  },
};

export default postService;
