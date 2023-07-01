import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import FieldTableElementCreateCommand from "./dto/FieldTableElementCreateCommand";
import FieldTableElementUpdateCommand from "./dto/FieldTableElementUpdateCommand";
import FieldTableElement, {
  IFieldTableElement,
} from "./fieldTableElement.model";

const fieldTableElementRepository = {
  create: async (
    command: FieldTableElementCreateCommand
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
    command: FieldTableElementUpdateCommand
  ): Promise<IFieldTableElement> => {
    const oldFieldTableElement: IFieldTableElement =
      await FieldTableElement.findById(command._id);

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

    const updatedTableElement: IFieldTableElement =
      await FieldTableElement.findById(command._id).exec();

    return updatedTableElement;
  },
  createMany: async (
    commands: FieldTableElementCreateCommand[]
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
    commands: FieldTableElementUpdateCommand[]
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
