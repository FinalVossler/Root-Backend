import { IFile } from "../file/file.model";
import fileRepository from "../file/file.repository";
import PostCreateCommand from "./dto/PostCreateCommand";
import PostsSearchCommand from "./dto/PostsSearchCommand";
import PostsGetCommand from "./dto/PostsGetCommand";
import Post, { IPost } from "./post.model";
import File from "../file/file.model";
import { IUser } from "../user/user.model";

const postRepository = {
  create: async (
    command: PostCreateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const createdFiles: IFile[] = await fileRepository.createFiles(
      command.files,
      currentUser
    );

    const post = await Post.create({
      title: [{ text: command.title, language: command.language }],
      subTitle: [{ text: command.subTitle, language: command.language }],
      content: [{ text: command.content, language: command.language }],
      files: createdFiles.map((f) => f._id),
      posterId: command.posterId,
      visibility: command.visibility,
      design: command.design,
      children: command.children,
    });

    await post.populate(populationOptions);

    return post;
  },
  getUserPosts: async (
    command: PostsGetCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const posts: IPost[] = await Post.find({
      posterId: command.userId,
      visibility: { $in: command.visibilities },
    })
      .populate(populationOptions)
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
  search: async (
    command: PostsSearchCommand
  ): Promise<{ posts: IPost[]; total: number }> => {
    const query = Post.find({
      title: { $elemMatch: { text: { $regex: command.title } } },
      visibility: { $in: command.visibilities },
      posterId: command.posterId,
    }).populate(populationOptions);

    const posts: IPost[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Post.find({
      title: { $elemMatch: { text: { $regex: command.title } } },
      visibility: { $in: command.visibilities },
      posterId: command.posterId,
    }).count();

    return { posts, total };
  },
  getById: async (postId: string): Promise<IPost> => {
    return await Post.findById(postId).exec();
  },
  delete: async (postId: string): Promise<void> => {
    return await Post.remove({ _id: postId });
  },
};

const populationOptions = [
  {
    path: "files",
    model: File.modelName,
  },
  {
    path: "children",
    model: Post.modelName,
    populate: {
      path: "files",
      model: File.modelName,
    },
  },
];

export default postRepository;
