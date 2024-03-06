import {
  IPageCreateCommand,
  IPageUpdateCommand,
  PermissionEnum,
} from "roottypes";

import IPage from "./interfaces/IPage";
import IPageService from "./interfaces/IPageService";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IPageRepository from "./interfaces/IPageRepository";
import IUser from "../../user/ports/interfaces/IUser";

const createPageService = (
  pageRepository: IPageRepository,
  roleService: IRoleService
): IPageService => ({
  get: async (): Promise<IPage[]> => {
    const pages: IPage[] = await pageRepository.get();

    return pages;
  },
  create: async (
    command: IPageCreateCommand,
    currentUser: IUser
  ): Promise<IPage> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreatePage,
    });

    const page: IPage = await pageRepository.create(command);

    return page;
  },
  update: async (
    command: IPageUpdateCommand,
    currentUser: IUser
  ): Promise<IPage> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdatePage,
    });

    const page: IPage = await pageRepository.update(command);

    return page;
  },
  deleteByIds: async (ids: string[], currentUser: IUser): Promise<void> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeletePage,
    });
    await pageRepository.deleteByIds(ids);
  },
});

export default createPageService;
