import { IPageCreateCommand, IPageUpdateCommand } from "roottypes";
import IPage from "./IPage";
import IUser from "../../../user/ports/interfaces/IUser";

interface IPageService {
  get: () => Promise<IPage[]>;
  create: (command: IPageCreateCommand, currentUser: IUser) => Promise<IPage>;
  update: (command: IPageUpdateCommand, currentUser: IUser) => Promise<IPage>;
  deleteByIds: (ids: string[], currentUser: IUser) => Promise<void>;
}

export default IPageService;
