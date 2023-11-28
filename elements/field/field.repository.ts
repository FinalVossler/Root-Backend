import mongoose from "mongoose";

import FieldCreateCommand from "./dto/FieldCreateCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import { IField } from "./field.model";
import Field from "./field.model";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import FieldsSearchCommand from "./dto/FieldsSearchCommand";
import { IEventRequestHeader } from "../event/event.model";
import { IFieldTableElement } from "../fieldTableElement/fieldTableElement.model";
import fieldTableElementRepository from "../fieldTableElement/fieldTableElement.repository";
import FieldTableElementCreateCommand from "../fieldTableElement/dto/FieldTableElementCreateCommand";
import EventCommand from "../event/dto/EventCommand";

const fieldRepository = {
  create: async (command: FieldCreateCommand): Promise<IField> => {
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
      fieldEvents: command.fieldEvents.map<EventCommand>(
        (fieldEvent: EventCommand) => ({
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
    });

    await field.populate(populationOptions);

    return field;
  },
  update: async (command: FieldUpdateCommand): Promise<IField> => {
    const field: IField | null = await Field.findById(command._id);

    if (!field) {
      throw new Error("Field not found");
    }

    // Columns to delete
    const columnsToDelete: IFieldTableElement[] =
      field.tableOptions?.columns?.filter(
        (c) =>
          !command.tableOptions?.columns.some(
            (cc) => cc._id?.toString() === c._id.toString()
          )
      ) || [];

    await fieldTableElementRepository.deleteMany(
      columnsToDelete.map((c) => c._id.toString())
    );

    // Rows to delete
    const rowsToDelete: IFieldTableElement[] =
      field.tableOptions?.rows?.filter(
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
            const createCommand: FieldTableElementCreateCommand = {
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
            const createCommand: FieldTableElementCreateCommand = {
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
            (c) => c._id.toString() === cc._id?.toString()
          )
        )
      );

    // Rows to update
    const updatedRows: IFieldTableElement[] =
      await fieldTableElementRepository.updateMany(
        command.tableOptions.rows.filter((cc) =>
          field.tableOptions?.rows.some(
            (c) => c._id.toString() === cc._id?.toString()
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
          fieldEvents: command.fieldEvents.map<EventCommand>(
            (fieldEvent: EventCommand) => ({
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

    const newField: IField = await fieldRepository.getById(command._id);

    return newField;
  },
  getById: async (id: string): Promise<IField> => {
    const field: IField | null = await Field.findById(id).populate(
      populationOptions
    );

    if (!field) {
      throw new Error("Field not found");
    }
    return field;
  },
  getFields: async (
    command: FieldsGetCommand
  ): Promise<{ total: number; fields: IField[] }> => {
    const fields: IField[] = await Field.find({})
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Field.find({}).count();

    return { fields, total };
  },
  deleteFields: async (fieldsIds: mongoose.Types.ObjectId[]): Promise<void> => {
    for (let i = 0; i < fieldsIds.length; i++) {
      await Field.deleteOne({ _id: fieldsIds[i] });
    }

    return;
  },
  search: async (
    command: FieldsSearchCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const query = Field.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    });

    const fields: IField[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Field.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { fields, total };
  },
  getByIds: async (ids: string[]): Promise<IField[]> => {
    const fields: IField[] = await Field.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    }).populate(populationOptions);

    return fields;
  },
  copy: async (ids: string[]): Promise<IField[]> => {
    const fieldsToCopy: IField[] = await fieldRepository.getByIds(ids);

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
                  name: column.name.map((translatedText) => ({
                    text: translatedText.text,
                    language: translatedText.language,
                  })),
                })) || []
              );

            const createdRows: IFieldTableElement[] =
              await fieldTableElementRepository.createMany(
                field.tableOptions?.rows.map((row) => ({
                  // language doesn't matter
                  language: "en",
                  name: row.name.map((translatedText) => ({
                    text: translatedText.text,
                    language: translatedText.language,
                  })),
                })) || []
              );

            const newField: IField = await Field.create({
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

            const populatedNewField = await fieldRepository.getById(
              newField._id.toString()
            );

            resolve(populatedNewField);
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    const fields: IField[] = await Promise.all(promises);

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

export default fieldRepository;
