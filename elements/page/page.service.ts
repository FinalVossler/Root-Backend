import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";
import { IPage } from "./page.model";
import pageRepository from "./page.repository";
import mongoose from "mongoose";

const pageService = {
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await pageRepository.get();

    return pages;
  },
  create: async (command: IPageCreateCommand): Promise<IPage> => {
    const page: IPage = await pageRepository.create(command);

    return page;
  },
  update: async (command: IPageUpdateCommand): Promise<IPage> => {
    const page: IPage = await pageRepository.update(command);

    return page;
  },
  deleteByIds: async (ids: string[]): Promise<void> => {
    await pageRepository.deleteByIds(
      ids.map((id) => new mongoose.Types.ObjectId(id))
    );
  },
};

export default pageService;
