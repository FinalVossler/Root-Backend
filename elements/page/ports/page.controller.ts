import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";
import { pageToReadDto } from "./page.toReadDto";
import IPage from "./interfaces/IPage";
import IPageService from "./interfaces/IPageService";
import IPageController from "./interfaces/IPageController";
import IRequest from "../../../globalTypes/IRequest";
import IUser from "../../user/ports/interfaces/IUser";

const createPageController = (pageService: IPageService): IPageController => ({
  getPage: async () => {
    const pages: IPage[] = await pageService.get();

    return {
      data: pages.map((p) => pageToReadDto(p)),
      success: true,
    };
  },
  createPage: async (req: IRequest<IPageCreateCommand>, currentUser: IUser) => {
    const command: IPageCreateCommand = req.body;

    const page: IPage = await pageService.create(command, currentUser);

    return {
      data: pageToReadDto(page),
      success: true,
    };
  },
  updatePage: async (req: IRequest<IPageUpdateCommand>, currentUser: IUser) => {
    const command: IPageUpdateCommand = req.body;

    const page: IPage = await pageService.update(command, currentUser);

    return {
      data: pageToReadDto(page),
      success: true,
    };
  },
  deletePages: async (req: IRequest<string[]>, currentUser: IUser) => {
    const pagesIds = req.body;

    await pageService.deleteByIds(
      pagesIds.map((pageId) => pageId.toString()),
      currentUser
    );

    return {
      success: true,
      data: null,
    };
  },
});

export default createPageController;
