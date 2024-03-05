import mongoose from "mongoose";
import IPage from "./IPage";
import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";

interface IPageRepository {
  get: () => Promise<IPage[]>;
  create: (command: IPageCreateCommand) => Promise<IPage>;
  update: (command: IPageUpdateCommand) => Promise<IPage>;
  getById: (id: mongoose.Types.ObjectId | string) => Promise<IPage | null>;
  delete: (id: mongoose.Types.ObjectId | string) => Promise<void>;
  deleteByIds: (ids: mongoose.Types.ObjectId[] | string[]) => Promise<void>;
}

export default IPageRepository;
