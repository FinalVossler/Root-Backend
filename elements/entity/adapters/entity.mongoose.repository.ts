import mongoose from "mongoose";

import Entity from "./entity.mongoose.model";
import Model from "../../model/adapters/model.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import fileRepository from "../../file/adapters/file.mongoose.repository";
import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
} from "roottypes";
import { IField } from "../../field/ports/interfaces/IField";
import IEntity from "../ports/interfaces/IEntity";
import IFile from "../../file/ports/interfaces/IFile";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";
import IEntityRepository from "../ports/interfaces/IEntityRepository";

const entityMongooseRepository: IEntityRepository = {
  combineEntityFieldValuesNewFilesAndSelectedOwnFiles: async (
    entityFieldValues: IEntityFieldValueCommand[]
  ) => {
    const createFilesPromises: Promise<IFile[]>[] = [];
    entityFieldValues.forEach(async (entityFieldValue) => {
      const promise: Promise<IFile[]> = new Promise(async (resolve, reject) => {
        const createdFiles: IFile[] = await fileRepository.createFiles(
          entityFieldValue.files.filter((el) => !el._id)
        );

        const allFiles = createdFiles.concat(
          (entityFieldValue.files as IFile[]).filter((el) => el._id)
        );

        (entityFieldValue.files as IFile[]) = allFiles;

        resolve(allFiles);
      });

      createFilesPromises.push(promise);
    });

    await Promise.all(createFilesPromises);
  },
  create: async function (
    command: IEntityCreateCommand,
    ownerId?: string
  ): Promise<IEntity> {
    await this.combineEntityFieldValuesNewFilesAndSelectedOwnFiles(
      command.entityFieldValues
    );

    const entity = await Entity.create({
      model: command.modelId,
      entityFieldValues: command.entityFieldValues.map((fieldValue) => ({
        field: fieldValue.fieldId,
        value: [{ language: command.language, text: fieldValue.value }],
        files: fieldValue.files.map((f) => f._id),
        tableValues: fieldValue.tableValues.map((tableValue) => ({
          column: tableValue.columnId,
          row: tableValue.rowId,
          value: [{ language: command.language, text: tableValue.value }],
        })),
        yearTableValues: fieldValue.yearTableValues.map(
          (yearTableRowValues) => ({
            row: yearTableRowValues.rowId,
            values: yearTableRowValues.values.map((value) => ({
              year: value.year,
              value: [{ language: command.language, text: value.value }],
            })),
          })
        ),
      })),
      assignedUsers: command.assignedUsersIds,
      owner: ownerId ? new mongoose.Types.ObjectId(ownerId) : undefined,
      availableShippingMethods:
        command.availableShippingMethodsIds?.map(
          (id) => new mongoose.Types.ObjectId(id)
        ) || [],
      ...(command.orderAssociationConfig
        ? { orderAssociationConfig: command.orderAssociationConfig }
        : {}),
    });

    return entity.populate(entityPopulationOptions);
  },
  update: async function (command: IEntityUpdateCommand): Promise<IEntity> {
    const entity: IEntity | null = await Entity.findById(command._id).populate(
      entityPopulationOptions
    );

    if (!entity) {
      throw new Error("Entity not found");
    }

    await this.combineEntityFieldValuesNewFilesAndSelectedOwnFiles(
      command.entityFieldValues
    );

    await Entity.updateOne(
      { _id: command._id },
      {
        $set: {
          model: command.modelId,
          entityFieldValues: command.entityFieldValues.map(
            (entityFieldValue) => {
              return {
                field: entityFieldValue.fieldId,
                files: entityFieldValue.files.map((f) => f._id),
                value: getNewTranslatedTextsForUpdate({
                  language: command.language,
                  newText: entityFieldValue.value,
                  oldValue: entity.entityFieldValues.find(
                    (el) =>
                      (el.field as IField)._id.toString() ===
                      entityFieldValue.fieldId.toString()
                  )?.value,
                }),
                tableValues: entityFieldValue.tableValues.map((tableValue) => ({
                  column: tableValue.columnId,
                  row: tableValue.rowId,
                  value: getNewTranslatedTextsForUpdate({
                    language: command.language,
                    newText: tableValue.value,
                    oldValue:
                      entity.entityFieldValues
                        .find(
                          (e) =>
                            (e.field as IField)._id.toString() ===
                            entityFieldValue.fieldId.toString()
                        )
                        ?.tableValues?.find(
                          (t) =>
                            (t.column as IFieldTableElement)._id.toString() ===
                              tableValue.columnId &&
                            (t.row as IFieldTableElement)._id.toString() ===
                              tableValue.rowId.toString()
                        )?.value || [],
                  }),
                })),
                yearTableValues: entityFieldValue.yearTableValues.map(
                  (yearTableRowValues) => ({
                    row: yearTableRowValues.rowId,
                    values: yearTableRowValues.values.map((value) => ({
                      year: value.year,
                      value: getNewTranslatedTextsForUpdate({
                        language: command.language,
                        newText: value.value,
                        oldValue:
                          entity.entityFieldValues
                            .find(
                              (e) =>
                                (e.field as IField)._id.toString() ===
                                entityFieldValue.fieldId.toString()
                            )
                            ?.yearTableValues?.find(
                              (t) =>
                                (t.row as IFieldTableElement)._id.toString() ===
                                yearTableRowValues.rowId.toString()
                            )
                            ?.values.find(
                              (yearValue) =>
                                yearValue.year.toString() ===
                                value.year.toString()
                            )?.value || [],
                      }),
                    })),
                  })
                ),
              };
            }
          ),
          assignedUsers: command.assignedUsersIds,
          availableShippingMethods:
            command.availableShippingMethodsIds?.map(
              (id) => new mongoose.Types.ObjectId(id)
            ) || [],
          ...(command.orderAssociationConfig
            ? { orderAssociationConfig: command.orderAssociationConfig }
            : {}),
        },
      }
    );

    const newEntity: IEntity | undefined = await this.getById(
      command._id.toString()
    );

    if (!newEntity) {
      throw new Error("Entity not found");
    }

    return newEntity;
  },
  getEntitiesByModel: async (
    command: IEntitiesGetCommand
  ): Promise<{ total: number; entities: IEntity[] }> => {
    const entities: IEntity[] = await Entity.find({ model: command.modelId })
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(entityPopulationOptions)
      .exec();

    const total: number = await Entity.find({ model: command.modelId }).count();

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: string[]): Promise<void> => {
    await Entity.deleteMany({
      _id: {
        $in: entitiesIds.map(
          (entityId) => new mongoose.Types.ObjectId(entityId)
        ),
      },
    });
  },
  getById: async (entityId: string): Promise<IEntity | undefined> => {
    const entity: IEntity | undefined = await (
      await Entity.findById(new mongoose.Types.ObjectId(entityId))
    )?.populate(entityPopulationOptions);

    return entity;
  },
  getAssignedEntitiesByModel: async (
    command: IEntitiesGetCommand
  ): Promise<{ total: number; entities: IEntity[] }> => {
    const findCondition = {
      assignedUsers: { $exists: true, $ne: [] },
      model: command.modelId,
    };

    const entities: IEntity[] = await Entity.find(findCondition)
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(entityPopulationOptions)
      .exec();

    const total: number = await Entity.find(findCondition).count();

    return { entities, total };
  },
  search: async (
    command: IEntitiesSearchCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const query = Entity.find({
      model: { _id: command.modelId },
      entityFieldValues: {
        $elemMatch: {
          $or: [{ value: { $elemMatch: { text: { $regex: command.name } } } }],
        },
      },
    });

    const entities: IEntity[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(entityPopulationOptions);

    const total = await Entity.find({
      model: { _id: command.modelId },
      entityFieldValues: {
        $elemMatch: {
          value: { $elemMatch: { text: { $regex: command.name } } },
        },
      },
    }).count();

    return { entities, total };
  },
  setCustomDataKeyValue: async function (
    command: IEntitiesSetCustomDataKeyValueCommand
  ): Promise<void> {
    const entity: IEntity | undefined = await this.getById(
      command.entityId.toString()
    );
    if (!entity) {
      throw new Error("Entity not found");
    }
    let oldCustomData;
    try {
      oldCustomData = JSON.parse(entity.customData || "{}");
    } catch {
      oldCustomData = {};
    }

    const newCustomData: IEntitiesSetCustomDataKeyValueCommand["value"] = {
      ...(oldCustomData || {}),
    };

    newCustomData[command.key] = command.value;

    await Entity.updateOne(
      {
        _id: command.entityId,
      },
      {
        $set: {
          customData: JSON.stringify(newCustomData),
        },
      }
    );
  },
  deleteByModel: async (modelId: string) => {
    await Entity.deleteMany({ model: new mongoose.Types.ObjectId(modelId) });
  },
};

export const entityPopulationOptions = [
  {
    path: "entityFieldValues",
    populate: [
      {
        path: "field",
        model: "field",
      },
      {
        path: "files",
        model: "file",
      },
      {
        path: "tableValues",
        populate: [
          {
            path: "column",
            model: "fieldTableElement",
          },
          {
            path: "row",
            model: "fieldTableElement",
          },
        ],
      },
      {
        path: "yearTableValues",
        populate: [
          {
            path: "row",
            model: "fieldTableElement",
          },
        ],
      },
    ],
  },
  {
    path: "model",
    model: Model.modelName,
  },
  {
    path: "customData",
  },
  {
    path: "assignedUsers",
    model: "user",
    populate: [
      {
        path: "role",
        model: "role",
      },
      {
        path: "profilePicture",
        model: "file",
      },
    ],
  },
  { path: "owner", model: "user" },
  { path: "availableShippingMethods", model: "shippingMethod" },
];

export default entityMongooseRepository;
