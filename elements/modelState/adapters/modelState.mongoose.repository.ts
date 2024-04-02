import mongoose from "mongoose";

import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import ModelState from "./modelState.mongoose.model";
import { IModelStateCreateCommand, IModelStateUpdateCommand } from "roottypes";
import IModelState from "../ports/interfaces/IModelState";
import IModelStateRepository from "../ports/interfaces/IModelStateRepository";

const modelStateMongooseRepository: IModelStateRepository = {
  createOne: async (
    command: IModelStateCreateCommand
  ): Promise<IModelState> => {
    const modelState: IModelState = (
      await ModelState.create({
        name: [{ language: command.language, text: command.name }],
        stateType: command.stateType,
        exlusive: command.exclusive,
      })
    ).toObject();

    return modelState;
  },
  updateOne: async (
    command: IModelStateUpdateCommand
  ): Promise<IModelState> => {
    const oldModelState: IModelState | null = await ModelState.findById(
      command._id
    );

    if (!oldModelState) {
      throw new Error("Model state doesn't exist");
    }

    const modelState = (
      await ModelState.findOneAndUpdate(
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
        },
        { new: true }
      ).exec()
    )?.toObject();

    if (!modelState) {
      throw new Error("Model state not found");
    }

    return modelState;
  },
  createMany: async (
    commands: IModelStateCreateCommand[]
  ): Promise<IModelState[]> => {
    const promises: Promise<IModelState>[] = commands.map((command) => {
      return new Promise<IModelState>(async (resolve, reject) => {
        const modelState: IModelState =
          await modelStateMongooseRepository.createOne(command);
        resolve(modelState);
      });
    });

    const modelStates: IModelState[] = await Promise.all(promises);
    return modelStates;
  },
  updateMany: async (commands: IModelStateUpdateCommand[]) => {
    const promises: Promise<IModelState>[] = commands.map((command) => {
      return new Promise<IModelState>(async (resolve, reject) => {
        if (command._id) {
          const modelState: IModelState =
            await modelStateMongooseRepository.updateOne(command);
          resolve(modelState);
        } else {
          const modelState: IModelState =
            await modelStateMongooseRepository.createOne({
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
  deleteMany: async (ids: string[]): Promise<void> => {
    await ModelState.deleteMany({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
};

export default modelStateMongooseRepository;
