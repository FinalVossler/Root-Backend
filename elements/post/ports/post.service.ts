import {
  IPostCreateCommand,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";

import IPost from "./interfaces/IPost";
import IUser from "../../user/ports/interfaces/IUser";
import IPostService from "./interfaces/IPostService";
import IPostRepository from "./interfaces/IPostRepository";

const createPostService = (postRepository: IPostRepository): IPostService => ({
  create: async (
    command: IPostCreateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const post: IPost = await postRepository.create(command, currentUser);

    return post;
  },
  getUserPosts: async (
    command: IPostsGetCommand,
    currentUser: IUser
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.getUserPosts(
      command,
      currentUser
    );

    return { posts, total };
  },
  search: async (
    command: IPostsSearchCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.search(command);

    return { posts, total };
  },
  getById: async function (postId: string): Promise<IPost | null> {
    return await postRepository.getById(postId);
  },
  update: async (
    command: IPostUpdateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const oldPost = await postRepository.getById(command._id);

    if (!oldPost) {
      throw new Error("Post doesn't exist");
    }

    if (oldPost.poster.toString() !== currentUser._id.toString()) {
      throw new Error("Unauthorized. The post isn't yours");
    }

    const post: IPost | null = await postRepository.update(
      command,
      oldPost,
      currentUser
    );

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },
  delete: async function (postId: string, currentUser: IUser): Promise<void> {
    const post: IPost | null = await this.getById(postId);
    if (!post) {
      throw new Error("Post doesn't exist");
    }
    if (post.poster.toString() !== currentUser._id.toString())
      throw new Error("Unauthorized to delete post");

    await postRepository.delete(postId);
  },
});

export default createPostService;
