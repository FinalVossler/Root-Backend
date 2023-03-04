import PostCreateCommand from "./dto/PostCreateCommand";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import { IPost } from "./post.model";
import postRepository from "./post.repository";
import { IUser } from "../user/user.model";
import mongoose from "mongoose";

const postService = {
  createPost: async (
    command: PostCreateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const post: IPost = await postRepository.createPost(command, currentUser);

    return post;
  },
  getUserPosts: async (
    command: PostsGetCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.getUserPosts(command);

    return { posts, total };
  },
  search: async (
    command: PostsSearchCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.search(command);

    return { posts, total };
  },
  getById: async (postId: string): Promise<IPost> => {
    return await postRepository.getById(postId);
  },
  delete: async (postId: string, currentUser: IUser): Promise<void> => {
    const post: IPost = await postService.getById(postId);
    if (post.posterId.toString() !== currentUser._id.toString())
      throw new Error("Unauthorized to delete post");

    await postRepository.delete(postId);
  },
};

export default postService;
