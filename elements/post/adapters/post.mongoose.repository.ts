import mongoose from "mongoose";

import fileRepository from "../../file/adapters/file.mongoose.repository";
import File from "../../file/adapters/file.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import {
  IPostCreateCommand,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
  PostVisibilityEnum,
} from "roottypes";
import IPostRepository from "../ports/interfaces/IPostRepository";
import IUser from "../../user/ports/interfaces/IUser";
import IPost from "../ports/interfaces/IPost";
import Post from "./post.mongoose.model";
import IFile from "../../file/ports/interfaces/IFile";

const postMongooseRepository: IPostRepository = {
  create: async (
    command: IPostCreateCommand,
    currentUser: IUser
  ): Promise<IPost> => {
    const createdFiles: IFile[] = await fileRepository.createFiles(
      command.files.filter((el) => !el._id),
      currentUser
    );

    const allFiles = createdFiles.concat(
      (command.files as IFile[]).filter((el) => el._id)
    );

    const post = (
      await (
        await Post.create({
          title: [{ text: command.title, language: command.language }],
          subTitle: [{ text: command.subTitle, language: command.language }],
          content: [
            { text: command.content || "", language: command.language },
          ],
          files: allFiles.map((f) => f._id),
          poster: command.posterId,
          visibility: command.visibility,
          design: command.design,
          children: command.children,
          code: command.code,
        })
      ).populate(populationOptions)
    ).toObject();

    return post;
  },
  getUserPosts: async (
    command: IPostsGetCommand,
    currentUser: IUser
  ): Promise<{ posts: IPost[]; total: number }> => {
    let visibilities = [...command.visibilities];
    // if the current user isn't the same as the user making the request, then we must force removing the "private" visibility from the request
    if (currentUser._id.toString() !== command.userId.toString()) {
      visibilities = visibilities.filter(
        (el) => el !== PostVisibilityEnum.Private
      );
    }

    const conditionsQuery = {
      poster: new mongoose.Types.ObjectId(command.userId),
      visibility: { $in: visibilities },
    };

    const posts: IPost[] = await Post.find(conditionsQuery)
      .populate(populationOptions)
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .lean()
      .exec();

    const total: number = await Post.find(conditionsQuery).count();

    return { posts, total };
  },
  search: async (
    command: IPostsSearchCommand
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
      .populate(populationOptions)
      .lean();

    const total = await Post.find({
      title: { $elemMatch: { text: { $regex: command.title } } },
      visibility: { $in: command.visibilities },
      posterId: command.posterId,
    }).count();

    return { posts, total };
  },
  getById: async (postId: string) => {
    return await Post.findById(new mongoose.Types.ObjectId(postId))
      .populate(populationOptions)
      .lean()
      .exec();
  },
  update: async (
    command: IPostUpdateCommand,
    oldPost: IPost,
    currentUser: IUser
  ) => {
    const createdFiles: IFile[] = await fileRepository.createFiles(
      command.files.filter((el) => !el._id),
      currentUser
    );

    const allFiles: IFile[] = createdFiles.concat(
      (command.files as IFile[]).filter((el) => el._id)
    );

    const updatedPost = await Post.findOneAndUpdate(
      { _id: command._id },
      {
        $set: {
          title: getNewTranslatedTextsForUpdate({
            oldValue: oldPost.title,
            language: command.language,
            newText: command.title || "",
          }),
          children: command.children,
          content: getNewTranslatedTextsForUpdate({
            oldValue: oldPost.content,
            language: command.language,
            newText: command.content || "",
          }),
          design: command.design,
          files: allFiles.map((el) => el._id),
          subTitle: getNewTranslatedTextsForUpdate({
            oldValue: oldPost.subTitle,
            language: command.language,
            newText: command.subTitle || "",
          }),
          code: command.code,
          visibility: command.visibility,
        },
      },
      { new: true }
    )
      .populate(populationOptions)
      .lean();

    return updatedPost;
  },

  delete: async (postId: string): Promise<any> => {
    return await Post.deleteOne({ _id: new mongoose.Types.ObjectId(postId) });
  },

  deleteUsersPosts: async (usersIds: string[]): Promise<any> => {
    return await Post.deleteMany({
      poster: { $in: usersIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
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

export default postMongooseRepository;
