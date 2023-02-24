import mongoose from "mongoose";

import PageCreateCommand from "./dto/PageCreateCommand";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import Page, { IPage } from "./page.model";
import Post from "../post/post.model";
import File from "../file/file.model";

const pageRepository = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await Page.find()
      .populate({
        path: "posts",
        populate: {
          path: "children",
          model: Post.modelName,
          populate: {
            path: "files",
            model: File.modelName,
          },
        },
      })
      .populate({
        path: "posts",
        populate: {
          path: "files",
          model: File.modelName,
        },
      });

    return pages;
  },
  create: async (command: PageCreateCommand): Promise<IPage> => {
    const page = await Page.create({
      posts: command.posts,
      title: command.title,
    });

    page.populate({
      path: "posts",
      populate: {
        path: "children",
        model: Post.modelName,
        populate: {
          path: "files",
          model: File.modelName,
        },
      },
    });

    return page as IPage;
  },
  update: async (command: PageUpdateCommand): Promise<IPage> => {
    await Page.updateOne(
      { _id: command._id },
      {
        $set: {
          posts: command.posts,
          title: command.title,
        },
      }
    );

    const page = await pageRepository.getById(command._id);

    return page;
  },
  getById: async (id: mongoose.ObjectId | string): Promise<IPage> => {
    const page: IPage = await Page.findById(id).populate({
      path: "posts",
      populate: {
        path: "children",
        model: Post.modelName,
        populate: {
          path: "files",
          model: File.modelName,
        },
      },
    });

    return page;
  },
};

export default pageRepository;
