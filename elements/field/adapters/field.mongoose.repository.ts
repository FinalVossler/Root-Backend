import mongoose from "mongoose";
import {
  IEventCommand,
  IFieldCreateCommand,
  IFieldTableElementCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";

import Field from "./field.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import fieldTableElementRepository from "../../fieldTableElement/adapters/fieldTableElement.mongoose.repository";
import IFieldRepository from "../ports/interfaces/IFieldRepository";
import { IField } from "../ports/interfaces/IField";
import { IEventRequestHeader } from "../../event/ports/interfaces/IEvent";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";

const fieldMongooseRepository: IFieldRepository = {
  create: async (
    command: IFieldCreateCommand,
    ownerId?: string
  ): Promise<IField> => {
    const createdColumns: IFieldTableElement[] =
      await fieldTableElementRepository.createMany(
        command.tableOptions.columns
      );
    const createdRows: IFieldTableElement[] =
      await fieldTableElementRepository.createMany(command.tableOptions.rows);

    const field = await Field.create({
      name: [{ language: command.language, text: command.name }],
      type: command.type,
      canChooseFromExistingFiles: command.canChooseFromExistingFiles,
      options: command.options?.map((option) => ({
        label: [{ language: command.language, text: option.label }],
        value: option.value,
      })),
      fieldEvents: command.fieldEvents.map<IEventCommand>(
        (fieldEvent: IEventCommand) => ({
          eventTrigger: fieldEvent.eventTrigger,
          eventType: fieldEvent.eventType,
          redirectionToSelf: fieldEvent.redirectionToSelf,
          redirectionUrl: fieldEvent.redirectionUrl,
          requestData: fieldEvent.requestData,
          requestDataIsCreatedEntity: fieldEvent.requestDataIsCreatedEntity,
          requestMethod: fieldEvent.requestMethod,
          requestUrl: fieldEvent.requestUrl,
          requestHeaders: fieldEvent.requestHeaders.map<IEventRequestHeader>(
            (header: IEventRequestHeader) => ({
              key: header.key,
              value: header.value,
            })
          ),
          microFrontend: fieldEvent.microFrontendId,
          microFrontendComponentId: fieldEvent.microFrontendComponentId,
        })
      ),
      tableOptions: {
        name: [{ language: command.language, text: command.tableOptions.name }],
        columns: createdColumns.map((c) => c._id),
        rows: createdRows.map((r) => r._id),
        yearTable: command.tableOptions.yearTable,
      },
      owner: new mongoose.Types.ObjectId(ownerId),
    });

    await field.populate(populationOptions);

    return field.toObject();
  },
  update: async function (command: IFieldUpdateCommand): Promise<IField> {
    const field: IField | null = await Field.findById(command._id);

    if (!field) {
      throw new Error("Field not found");
    }

    // Columns to delete
    const columnsToDelete: IFieldTableElement[] =
      (field.tableOptions?.columns as IFieldTableElement[])?.filter(
        (c) =>
          !command.tableOptions?.columns.some(
            (cc) =>
              cc._id?.toString() === (c as IFieldTableElement)._id.toString()
          )
      ) || [];

    await fieldTableElementRepository.deleteMany(
      columnsToDelete.map((c) => c._id.toString())
    );

    // Rows to delete
    const rowsToDelete: IFieldTableElement[] =
      (field.tableOptions?.rows as IFieldTableElement[])?.filter(
        (r) =>
          !command.tableOptions?.rows.some(
            (cr) => cr._id?.toString() === r._id.toString()
          )
      ) || [];

    await fieldTableElementRepository.deleteMany(
      rowsToDelete.map((c) => c._id.toString())
    );

    // Columns to create
    const createdColumns: IFieldTableElement[] =
      await fieldTableElementRepository.createMany(
        command.tableOptions.columns
          .filter((c) => !Boolean(c._id))
          .map((command) => {
            const createCommand: IFieldTableElementCreateCommand = {
              language: command.language,
              name: command.name,
            };

            return createCommand;
          })
      );

    // Rows to create
    const createdRows: IFieldTableElement[] =
      await fieldTableElementRepository.createMany(
        command.tableOptions.rows
          .filter((r) => !Boolean(r._id))
          .map((command) => {
            const createCommand: IFieldTableElementCreateCommand = {
              language: command.language,
              name: command.name,
            };

            return createCommand;
          })
      );

    // Columns to update
    const updatedColumns: IFieldTableElement[] =
      await fieldTableElementRepository.updateMany(
        command.tableOptions.columns.filter((cc) =>
          field.tableOptions?.columns.some(
            (c) =>
              (c as IFieldTableElement)._id.toString() === cc._id?.toString()
          )
        )
      );

    // Rows to update
    const updatedRows: IFieldTableElement[] =
      await fieldTableElementRepository.updateMany(
        command.tableOptions.rows.filter((cc) =>
          field.tableOptions?.rows.some(
            (c) =>
              (c as IFieldTableElement)._id.toString() === cc._id?.toString()
          )
        )
      );

    const allColumns: IFieldTableElement[] =
      createdColumns.concat(updatedColumns);
    const allRows: IFieldTableElement[] = createdRows.concat(updatedRows);

    await Field.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: field.name,
          }),
          type: command.type,
          canChooseFromExistingFiles: command.canChooseFromExistingFiles,
          options: command.options?.map((option) => ({
            value: option.value,
            label: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: option.label,
              oldValue: field.options?.find((op) => op.value === option.value)
                ?.label,
            }),
          })),
          fieldEvents: command.fieldEvents.map<IEventCommand>(
            (fieldEvent: IEventCommand) => ({
              eventTrigger: fieldEvent.eventTrigger,
              eventType: fieldEvent.eventType,
              redirectionToSelf: fieldEvent.redirectionToSelf,
              redirectionUrl: fieldEvent.redirectionUrl,
              requestData: fieldEvent.requestData,
              requestDataIsCreatedEntity: fieldEvent.requestDataIsCreatedEntity,
              requestMethod: fieldEvent.requestMethod,
              requestUrl: fieldEvent.requestUrl,
              requestHeaders:
                fieldEvent.requestHeaders.map<IEventRequestHeader>(
                  (header: IEventRequestHeader) => ({
                    key: header.key,
                    value: header.value,
                  })
                ),
              microFrontend: fieldEvent.microFrontendId,
              microFrontendComponentId: fieldEvent.microFrontendComponentId,
            })
          ),

          tableOptions: {
            name: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: command.tableOptions.name,
              oldValue: field.tableOptions?.name,
            }),
            columns: command.tableOptions.columns.map(
              (column) =>
                allColumns.find((c) =>
                  Boolean(column._id)
                    ? c._id.toString() === column._id?.toString()
                    : c.name.find((t) => t.text === column.name)
                )?._id || ""
            ),
            rows: command.tableOptions.rows.map(
              (row) =>
                allRows.find((c) =>
                  Boolean(row._id)
                    ? c._id.toString() === row._id?.toString()
                    : c.name.find((t) => t.text === row.name)
                )?._id || ""
            ),
            yearTable: command.tableOptions.yearTable,
          },
        },
      }
    );

    const newField: IField = await this.getById(command._id);

    return newField;
  },
  getById: async (id: string): Promise<IField> => {
    const field = await Field.findById(id).populate(populationOptions);

    if (!field) {
      throw new Error("Field not found");
    }
    return field.toObject();
  },
  getFields: async (
    command: IFieldsGetCommand,
    ownerId?: string
  ): Promise<{ total: number; fields: IField[] }> => {
    const queryCondition = {
      ...(ownerId ? { owner: new mongoose.Types.ObjectId(ownerId) } : {}),
    };

    const fields = await Field.find(queryCondition)
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Field.find(queryCondition).count();

    return { fields: fields.map((f) => f.toObject()), total };
  },
  deleteFields: async (fieldsIds: string[]): Promise<void> => {
    for (let i = 0; i < fieldsIds.length; i++) {
      await Field.deleteOne({
        _id: new mongoose.Types.ObjectId(fieldsIds[i]),
      });
    }

    return;
  },
  search: async (
    command: IFieldsSearchCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const query = Field.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    });

    const fields = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Field.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { fields: fields.map((f) => f.toObject()), total };
  },
  getByIds: async (ids: string[]): Promise<IField[]> => {
    const fields = await Field.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    }).populate(populationOptions);

    return fields.map((f) => f.toObject());
  },
  copy: async function (ids: string[]): Promise<IField[]> {
    const fieldsToCopy: IField[] = await this.getByIds(ids);

    const promises: Promise<IField>[] = [];

    fieldsToCopy.forEach((field) => {
      promises.push(
        new Promise<IField>(async (resolve, reject) => {
          try {
            const createdColumns: IFieldTableElement[] =
              await fieldTableElementRepository.createMany(
                field.tableOptions?.columns?.map((column) => ({
                  // language doesn't matter
                  language: "en",
                  name: (column as IFieldTableElement).name.map(
                    (translatedText) => ({
                      text: translatedText.text,
                      language: translatedText.language,
                    })
                  ),
                })) || []
              );

            const createdRows: IFieldTableElement[] =
              await fieldTableElementRepository.createMany(
                field.tableOptions?.rows.map((row) => ({
                  // language doesn't matter
                  language: "en",
                  name: (row as IFieldTableElement).name.map(
                    (translatedText) => ({
                      text: translatedText.text,
                      language: translatedText.language,
                    })
                  ),
                })) || []
              );

            const newField = await Field.create({
              name: field.name.map((el) => ({
                language: el.language,
                text: el.text,
              })),
              type: field.type,
              canChooseFromExistingFiles: field.canChooseFromExistingFiles,
              options: field.options?.map((option) => ({
                label: option.label.map((el) => ({
                  language: el.language,
                  text: el.text,
                })),
                value: option.value,
              })),
              tableOptions: {
                name: field.tableOptions?.name?.map((translatedText) => ({
                  text: translatedText.text,
                  language: translatedText.language,
                })),
                columns: createdColumns.map((col) => col._id.toString()),
                rows: createdRows.map((row) => row._id.toString()),
                yearTable: field.tableOptions?.yearTable,
              },
              fieldEvents: {
                name: field.fieldEvents.map((fieldEvent) => ({
                  ...fieldEvent,
                })),
              },
            });

            const populatedNewField = await this.getById(
              newField._id.toString()
            );

            resolve(populatedNewField);
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    const fields = await Promise.all(promises);

    return fields;
  },
};

export const populationOptions = [
  {
    path: "tableOptions",
    populate: [
      {
        path: "columns",
        model: "fieldTableElement",
      },
      {
        path: "rows",
        model: "fieldTableElement",
      },
    ],
  },
  {
    path: "fieldEvents",
    populate: [
      {
        path: "microFrontend",
        model: "microFrontend",
        populate: [
          {
            path: "components",
            model: "microFrontendComponent",
          },
        ],
      },
    ],
  },
];

export default fieldMongooseRepository;
