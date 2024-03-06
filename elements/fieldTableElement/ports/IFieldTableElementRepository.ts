import {
  IFieldTableElementCreateCommand,
  IFieldTableElementUpdateCommand,
} from "roottypes";

import IFieldTableElement from "../ports/IFieldTableElement";

interface IFieldTableElementRepository {
  create: (
    command: IFieldTableElementCreateCommand
  ) => Promise<IFieldTableElement>;
  update: (
    command: IFieldTableElementUpdateCommand
  ) => Promise<IFieldTableElement>;
  createMany: (
    commands: IFieldTableElementCreateCommand[]
  ) => Promise<IFieldTableElement[]>;
  updateMany: (
    commands: IFieldTableElementUpdateCommand[]
  ) => Promise<IFieldTableElement[]>;
  deleteMany: (ids: string[]) => Promise<void>;
}

export default IFieldTableElementRepository;
