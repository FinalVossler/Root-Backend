import { IFile } from "../file/file.model";
import fileRepository from "../file/file.repository";
import PostCreateCommand from "./dto/PostCreateCommand";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import Post, { IPost } from "./post.model";

const postRepository = {
  createPost: async (command: PostCreateCommand): Promise<IPost> => {
    const createdFiles: IFile[] = await fileRepository.createFiles(
      command.files
    );

    const promise: Promise<IPost> = (
      await Post.create({
        title: command.title,
        content: command.content,
        files: createdFiles.map((f) => f._id),
        posterId: command.posterId,
        visibility: command.visibility,
        design: command.design,
        children: command.children,
      })
    ).populate("files");

    const post: IPost = await promise;

    return post;
  },
  getUserPosts: async (
    command: PostsGetCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const posts: IPost[] = await Post.find({
      posterId: command.userId,
      visibility: { $in: command.visibilities },
    })
      .populate("files")
      .populate("children")
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .exec();

    const total: number = await Post.find({
      posterId: command.userId,
      visibility: { $in: command.visibilities },
    }).count();

    return { posts, total };
  },
  searchPosts: async (
    command: PostsSearchCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const query = Post.find({
      title: { $regex: command.title },
      visibility: { $in: command.visibilities },
      posterId: command.posterId,
    }).populate("children");

    const posts: IPost[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit);

    const total = await Post.find({
      title: { $regex: command.title },
      visibility: { $in: command.visibilities },
      posterId: command.posterId,
    }).count();

    return { posts, total };
  },
};

export default postRepository;
