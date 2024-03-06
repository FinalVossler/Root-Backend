import {
  IFieldTableElementCreateCommand,
  IFieldTableElementUpdateCommand,
} from "roottypes";

import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import FieldTableElement from "./fieldTableElement.mongoose.model";
import IFieldTableElement from "../ports/IFieldTableElement";
import IFieldTableElementRepository from "../ports/IFieldTableElementRepository";

const fieldTableElementRepository: IFieldTableElementRepository = {
  create: async (
    command: IFieldTableElementCreateCommand
  ): Promise<IFieldTableElement> => {
    const fieldTableElement: IFieldTableElement =
      await FieldTableElement.create({
        name:
          command.name.length && command.name[0]["language"]
            ? command.name
            : [{ language: command.language, text: command.name }],
      });

    return fieldTableElement;
  },
  update: async (
    command: IFieldTableElementUpdateCommand
  ): Promise<IFieldTableElement> => {
    const oldFieldTableElement: IFieldTableElement | null =
      await FieldTableElement.findById(command._id);

    if (!oldFieldTableElement) {
      throw new Error("Old field table element not found");
    }

    await FieldTableElement.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: oldFieldTableElement?.name,
          }),
        },
      }
    );

    const updatedTableElement: IFieldTableElement | null =
      await FieldTableElement.findById(command._id).exec();

    if (!updatedTableElement) {
      throw new Error("Table element not found");
    }

    return updatedTableElement;
  },
  createMany: async (
    commands: IFieldTableElementCreateCommand[]
  ): Promise<IFieldTableElement[]> => {
    const promises: Promise<IFieldTableElement>[] = [];

    commands.forEach((command) => {
      promises.push(
        new Promise<IFieldTableElement>(async (resolve, reject) => {
          const fieldTableElement: IFieldTableElement =
            await fieldTableElementRepository.create(command);
          resolve(fieldTableElement);
        })
      );
    });

    const createdFieldTableElements: IFieldTableElement[] = await Promise.all(
      promises
    );

    return createdFieldTableElements;
  },

  updateMany: async (
    commands: IFieldTableElementUpdateCommand[]
  ): Promise<IFieldTableElement[]> => {
    const promises: Promise<IFieldTableElement>[] = [];

    commands.forEach((command) => {
      promises.push(
        new Promise(async (resolve, reject) => {
          const updatedTableElement: IFieldTableElement =
            await fieldTableElementRepository.update(command);
          resolve(updatedTableElement);
        })
      );
    });

    const updatedTableElements: IFieldTableElement[] = await Promise.all(
      promises
    );

    return updatedTableElements;
  },
  deleteMany: async (ids: string[]): Promise<void> => {
    if (ids.length > 0) {
      await FieldTableElement.deleteMany({ _id: { $in: ids } });
    }
  },
};

export default fieldTableElementRepository;
