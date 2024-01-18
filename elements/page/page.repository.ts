import mongoose from "mongoose";
import slugify from "slugify";

import Page, { IPage } from "./page.model";
import Post from "../post/post.model";
import File from "../file/file.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";

const pageRepository = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await Page.find().populate(populationOptions);

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

    const page = await query.populate(populationOptions);

    return page;
  },
  update: async (command: IPageUpdateCommand): Promise<IPage> => {
    const page = await pageRepository.getById(command._id);

    await Page.updateOne(
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
      }
    );

    const updatedPage: IPage | null = await pageRepository.getById(command._id);

    if (!updatedPage) {
      throw new Error("Page not found");
    }

    return updatedPage;
  },
  getById: async (
    id: mongoose.Types.ObjectId | string
  ): Promise<IPage | null> => {
    const page: IPage | null = await Page.findById(id).populate(
      populationOptions
    );

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

export default pageRepository;
