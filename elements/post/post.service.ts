import PostCreateCommand from "./dto/PostCreateCommand";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import { IPost } from "./post.model";
import postRepository from "./post.repository";
import { IUser } from "../user/user.model";

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
  searchPosts: async (
    command: PostsSearchCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.searchPosts(command);

    return { posts, total };
  },
};

export default postService;
