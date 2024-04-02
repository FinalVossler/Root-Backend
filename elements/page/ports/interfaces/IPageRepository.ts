import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";

import IPage from "./IPage";

interface IPageRepository {
  get: () => Promise<IPage[]>;
  create: (command: IPageCreateCommand) => Promise<IPage>;
  update: (command: IPageUpdateCommand) => Promise<IPage>;
  getById: (id: string) => Promise<IPage | null | undefined>;
  delete: (id: string) => Promise<void>;
  deleteByIds: (ids: string[] | string[]) => Promise<void>;
}

export default IPageRepository;
