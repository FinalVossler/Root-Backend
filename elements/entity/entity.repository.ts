import mongoose from "mongoose";

import Entity, { IEntity } from "./entity.model";
import Model from "../model/model.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import Field from "../field/field.model";
import EntityCreateCommand from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";

const entityRepository = {
  create: async (command: EntityCreateCommand): Promise<IEntity> => {
    const entity = await Entity.create({
      model: command.model,
      entityFieldValues: command.entityFieldValues.map((fieldValue) => ({
        field: fieldValue.field,
        value: [{ language: command.language, text: fieldValue.value }],
      })),
    });

    return entity.populate(populationOptions);
  },
  update: async (command: EntityUpdateCommand): Promise<IEntity> => {
    const entity: IEntity = await Entity.findById(command._id);

    await Entity.updateOne(
      { _id: command._id },
      {
        $set: {
          model: command.model,
          entityFieldValues: command.entityFieldValues.map((fieldValue) => ({
            field: fieldValue.field,
            value: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: fieldValue.value,
              oldValue: entity.entityFieldValues.find(
                (fieldValue) => fieldValue.field._id === fieldValue.field._id
              )?.value,
            }),
          })),
        },
      }
    );

    const newEntity: IEntity = await Entity.findById(command._id).populate(
      populationOptions
    );

    return newEntity;
  },
  getEntitiesByModel: async (
    command: EntitiesGetCommand
  ): Promise<{ total: number; entities: IEntity[] }> => {
    const entities: IEntity[] = await Entity.find({ model: command.model })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Entity.find({}).count();

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: mongoose.ObjectId[]): Promise<void> => {
    await Entity.deleteMany({ _id: { $in: entitiesIds } });
  },
};

const populationOptions = [
  {
    path: "entityFieldValues",
    populate: {
      path: "field",
      model: Field.modelName,
    },
  },
  {
    path: "model",
    model: Model.modelName,
  },
];

export default entityRepository;
