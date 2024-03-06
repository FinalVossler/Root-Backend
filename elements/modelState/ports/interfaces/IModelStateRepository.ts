import { IModelStateCreateCommand, IModelStateUpdateCommand } from "roottypes";

import IModelState from "./IModelState";

interface IModelStateRepository {
  createOne: (command: IModelStateCreateCommand) => Promise<IModelState>;
  updateOne: (command: IModelStateUpdateCommand) => Promise<IModelState>;
  createMany: (commands: IModelStateCreateCommand[]) => Promise<IModelState[]>;
  updateMany: (commands: IModelStateUpdateCommand[]) => Promise<IModelState[]>;
  deleteMany: (ids: string[]) => Promise<void>;
}

export default IModelStateRepository;
