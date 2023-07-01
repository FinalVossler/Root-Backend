import mongoose from "mongoose";

import Entity, { IEntity } from "./entity.model";
import Model from "../model/model.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import Field from "../field/field.model";
import File, { IFile } from "../file/file.model";
import EntityCreateCommand, {
  EntityFieldValueCommand,
} from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import fileRepository from "../file/file.repository";
import { IUser } from "../user/user.model";
import EntitiesSearchCommand from "./dto/EntitiesSearchCommand";

const entityRepository = {
  combineEntityFieldValuesNewFilesAndSelectedOwnFiles: async (
    entityFieldValues: EntityFieldValueCommand[]
  ) => {
    const createFilesPromises: Promise<IFile[]>[] = [];
    entityFieldValues.forEach(async (entityFieldValue) => {
      const promise: Promise<IFile[]> = new Promise(async (resolve, reject) => {
        const createdFiles: IFile[] = await fileRepository.createFiles(
          entityFieldValue.files.filter((el) => !el._id)
        );

        const allFiles = createdFiles.concat(
          entityFieldValue.files.filter((el) => el._id)
        );

        entityFieldValue.files = allFiles;

        resolve(allFiles);
      });

      createFilesPromises.push(promise);
    });

    await Promise.all(createFilesPromises);
  },
  create: async (command: EntityCreateCommand): Promise<IEntity> => {
    await entityRepository.combineEntityFieldValuesNewFilesAndSelectedOwnFiles(
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
    });

    return entity.populate(populationOptions);
  },
  update: async (
    command: EntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await Entity.findById(command._id).populate(
      populationOptions
    );

    await entityRepository.combineEntityFieldValuesNewFilesAndSelectedOwnFiles(
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
                      el.field._id.toString() ===
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
                            e.field._id.toString() ===
                            entityFieldValue.fieldId.toString()
                        )
                        ?.tableValues.find(
                          (t) =>
                            t.column._id.toString() === tableValue.columnId &&
                            t.row._id.toString() === tableValue.rowId.toString()
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
                                e.field._id.toString() ===
                                entityFieldValue.fieldId.toString()
                            )
                            .yearTableValues.find(
                              (t) =>
                                t.row._id.toString() ===
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
        },
      }
    );

    const newEntity: IEntity = await entityRepository.getById(
      command._id.toString()
    );

    return newEntity;
  },
  getEntitiesByModel: async (
    command: EntitiesGetCommand
  ): Promise<{ total: number; entities: IEntity[] }> => {
    const entities: IEntity[] = await Entity.find({ model: command.modelId })
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Entity.find({ model: command.modelId }).count();

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: mongoose.ObjectId[]): Promise<void> => {
    await Entity.deleteMany({ _id: { $in: entitiesIds } });
  },
  getById: async (entityId: string): Promise<IEntity> => {
    const entity: IEntity = await (
      await Entity.findById(entityId).exec()
    ).populate(populationOptions);

    return entity;
  },
  search: async (
    command: EntitiesSearchCommand
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
      .populate(populationOptions);

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
};

const populationOptions = [
  {
    path: "entityFieldValues",
    populate: [
      {
        path: "field",
        model: Field.modelName,
      },
      {
        path: "files",
        model: File.modelName,
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
];

export default entityRepository;
