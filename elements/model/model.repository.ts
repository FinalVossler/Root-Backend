import mongoose from "mongoose";

import Model, { IModel } from "./model.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
import Field from "../field/field.model";
import ModelsSearchCommand from "./dto/ModelsSearchCommand";

const modelRepository = {
  create: async (command: ModelCreateCommand): Promise<IModel> => {
    const model = await Model.create({
      name: [{ language: command.language, text: command.name }],
      modelFields: command.modelFields,
    });

    return model.populate(populationOptions);
  },
  update: async (command: ModelUpdateCommand): Promise<IModel> => {
    const model: IModel = await Model.findById(command._id);

    await Model.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: model.name,
          }),
          modelFields: command.modelFields,
        },
      }
    );

    const newModel: IModel = await Model.findById(command._id).populate(
      populationOptions
    );

    return newModel;
  },
  getModels: async (
    command: ModelsGetCommand
  ): Promise<{ total: number; models: IModel[] }> => {
    const models: IModel[] = await Model.find({})
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Model.find({}).count();

    return { models, total };
  },
  deleteModels: async (modelsIds: mongoose.ObjectId[]): Promise<void> => {
    await Model.deleteMany({ _id: { $in: modelsIds } });
  },
  search: async (
    command: ModelsSearchCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const query = Model.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    });

    const models: IModel[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Model.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { models, total };
  },
};

export const populationOptions = [
  {
    path: "modelFields",
    populate: {
      path: "field",
      model: "field",
      populate: {
        path: "options",
      },
    },
  },
];

export default modelRepository;
