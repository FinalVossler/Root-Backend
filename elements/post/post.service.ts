import PostCreateCommand from "./dto/PostCreateCommand";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import { IPost } from "./post.model";
import postRepository from "./post.repository";
import { IUser } from "../user/user.model";
import PostUpdateCommand from "./dto/PostUpdateCommand";

const postService = {
  create: async (
    command: PostCreateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const post: IPost = await postRepository.create(command, currentUser);

    return post;
  },
  getUserPosts: async (
    command: PostsGetCommand,
    currentUser: IUser
  ): Promise<{ posts: IPost[]; total: number }> => {
    const { posts, total } = await postRepository.getUserPosts(
      command,
      currentUser
    );

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
  update: async (
    command: PostUpdateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const oldPost = await postRepository.getById(command._id);

    if (oldPost.posterId.toString() !== currentUser._id.toString()) {
      throw new Error("Unauthorized. The post isn't yours");
    }

    const page: IPost = await postRepository.update(
      command,
      oldPost,
      currentUser
    );

    return page;
  },
  delete: async (postId: string, currentUser: IUser): Promise<void> => {
    const post: IPost = await postService.getById(postId);
    if (post.posterId.toString() !== currentUser._id.toString())
      throw new Error("Unauthorized to delete post");

    await postRepository.delete(postId);
  },
};

export default postService;
