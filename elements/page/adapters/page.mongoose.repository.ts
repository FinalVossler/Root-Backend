import mongoose from "mongoose";
import slugify from "slugify";

import Page from "./page.mongoose.model";
import Post from "../../post/adapters/post.mongoose.model";
import File from "../../file/adapters/file.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";
import IPage from "../ports/interfaces/IPage";
import IPageRepository from "../ports/interfaces/IPageRepository";

const pageMongooseRepository: IPageRepository = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = (await Page.find().populate(populationOptions)).map(
      (p) => p.toObject()
    );

    return pages;
  },
  create: async (command: IPageCreateCommand): Promise<IPage> => {
    const query = await Page.create({
      posts: command.posts.map((postId) => new mongoose.Types.ObjectId(postId)),
      title: [{ text: command.title, language: command.language }],
      showInHeader: command.showInHeader,
      slug: slugify(command.title),
      showInSideMenu: command.showInSideMenu,
    });

    const page = (await query.populate(populationOptions)).toObject();

    return page;
  },
  update: async (command: IPageUpdateCommand): Promise<IPage> => {
    const page = await pageMongooseRepository.getById(command._id);

    const updatedPage = (
      await Page.findOneAndUpdate(
        { _id: command._id },
        {
          $set: {
            posts: command.posts.map(
              (postId) => new mongoose.Types.ObjectId(postId)
            ),
            title: getNewTranslatedTextsForUpdate({
              oldValue: page?.title,
              language: command.language,
              newText: command.title,
            }),
            slug: command.slug,
            // The slug is managed in the onCreate mongoose middleware
            showInHeader: command.showInHeader,
            showInSideMenu: command.showInSideMenu,
          },
        },
        { new: true }
      ).populate(populationOptions)
    )?.toObject();

    if (!updatedPage) {
      throw new Error("Page not found");
    }

    return updatedPage;
  },
  getById: async (id: mongoose.Types.ObjectId | string) => {
    const page = (
      await Page.findById(id).populate(populationOptions)
    )?.toObject();

    return page;
  },
  delete: async (id: mongoose.Types.ObjectId | string): Promise<void> => {
    await Page.deleteOne({ _id: id }).exec();
  },
  deleteByIds: async (
    ids: mongoose.Types.ObjectId[] | string[]
  ): Promise<void> => {
    await Page.deleteOne({
      _id: { $in: ids.map((el) => new mongoose.Types.ObjectId(el)) },
    }).exec();
  },
};

const populationOptions = [
  {
    path: "posts",
    model: Post.modelName,
    populate: {
      path: "children",
      model: Post.modelName,
      populate: {
        path: "files",
        model: File.modelName,
      },
    },
  },
  {
    path: "posts",
    model: Post.modelName,
    populate: {
      path: "files",
      model: File.modelName,
    },
  },
];

export default pageMongooseRepository;
