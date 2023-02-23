import mongoose from "mongoose";
import PageCreateCommand from "./dto/PageCreateCommand";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import Page, { IPage } from "./page.model";

const pageRepository = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await Page.find().populate("posts");

    return pages;
  },
  create: async (command: PageCreateCommand): Promise<IPage> => {
    const page = await Page.create({
      posts: command.posts,
      title: command.title,
    });

    page.populate("posts");

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
    const page: IPage = await Page.findById(id).populate("posts");

    return page;
  },
};

export default pageRepository;
