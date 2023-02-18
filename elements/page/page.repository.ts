import mongoose from "mongoose";
import PageCreateCommand from "./dto/PageCreateCommand";
import PageUpdateCommand from "./dto/PageUpdateCommand";
import Page, { IPage } from "./page.model";

const pageRepository = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await Page.find();

    return pages;
  },
  create: async (command: PageCreateCommand): Promise<IPage> => {
    const page: IPage = (await Page.create({
      orderedPosts: command.orderedPosts,
      posts: command.orderedPosts,
      title: command.title,
    })) as IPage;

    return page;
  },
  update: async (command: PageUpdateCommand): Promise<IPage> => {
    await Page.updateOne(
      { _id: command._id },
      {
        $set: {
          orderedPosts: command.orderedPosts,
          posts: command.orderedPosts,
          title: command.title,
        },
      }
    );

    const page: IPage = await pageRepository.getById(command._id);

    return page;
  },
  getById: async (id: mongoose.ObjectId | string): Promise<IPage> => {
    const page: IPage = await Page.findById(id);

    return page;
  },
};

export default pageRepository;
