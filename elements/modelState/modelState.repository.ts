import mongoose from "mongoose";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import ModelStateCreateCommand from "./dto/ModelStateCreateCommand";
import ModelStateUpdateCommand from "./dto/ModelStateUpdateCommand";
import ModelState, { IModelState } from "./modelState.model";

const modelStateRepository = {
  createOne: async (command: ModelStateCreateCommand): Promise<IModelState> => {
    const modelState: IModelState = await ModelState.create({
      name: [{ language: command.language, text: command.name }],
      stateType: command.stateType,
      exlusive: command.exclusive,
    });
    return modelState;
  },
  updateOne: async (command: ModelStateUpdateCommand): Promise<IModelState> => {
    const oldModelState: IModelState = await ModelState.findById(command._id);
    await ModelState.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: oldModelState.name,
          }),
          exlusive: command.exclusive,
        },
      }
    ).exec();

    return await ModelState.findById(command._id);
  },
  createMany: async (
    commands: ModelStateCreateCommand[]
  ): Promise<IModelState[]> => {
    const promises: Promise<IModelState>[] = commands.map((command) => {
      return new Promise<IModelState>(async (resolve, reject) => {
        const modelState: IModelState = await modelStateRepository.createOne(
          command
        );
        resolve(modelState);
      });
    });

    const modelStates: IModelState[] = await Promise.all(promises);
    return modelStates;
  },
  updateMany: async (commands: ModelStateUpdateCommand[]) => {
    const promises: Promise<IModelState>[] = commands.map((command) => {
      return new Promise<IModelState>(async (resolve, reject) => {
        if (command._id) {
          const modelState: IModelState = await modelStateRepository.updateOne(
            command
          );
          resolve(modelState);
        } else {
          const modelState: IModelState = await modelStateRepository.createOne({
            language: command.language,
            name: command.name,
            stateType: command.stateType,
            exclusive: command.exclusive,
          });
          resolve(modelState);
        }
      });
    });

    const modelStates: IModelState[] = await Promise.all(promises);
    return modelStates;
  },
  deleteMany: async (ids: mongoose.Types.ObjectId[]): Promise<void> => {
    await ModelState.deleteMany({
      _id: { $in: ids },
    });
  },
};

export default modelStateRepository;
