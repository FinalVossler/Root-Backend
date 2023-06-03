import mongoose from "mongoose";

import FieldCreateCommand from "./dto/FieldCreateCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import { IField } from "./field.model";
import Field from "./field.model";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import FieldsSearchCommand from "./dto/FieldsSearchCommand";
import { IEvent, IEventRequestHeader } from "../event/event.model";

const fieldRepository = {
  create: async (command: FieldCreateCommand): Promise<IField> => {
    const field: IField = await Field.create({
      name: [{ language: command.language, text: command.name }],
      type: command.type,
      options: command.options.map((option) => ({
        label: [{ language: command.language, text: option.label }],
        value: option.value,
      })),
      fieldEvents: command.fieldEvents.map<IEvent>((fieldEvent: IEvent) => ({
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
      })),
    });

    return field;
  },
  update: async (command: FieldUpdateCommand): Promise<IField> => {
    const field: IField = await Field.findById(command._id);

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
          options: command.options.map((option) => ({
            value: option.value,
            label: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: option.label,
              oldValue: field.options.find((op) => op.value === option.value)
                ?.label,
            }),
          })),
          fieldEvents: command.fieldEvents.map<IEvent>(
            (fieldEvent: IEvent) => ({
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
            })
          ),
        },
      }
    );

    const newField: IField = await Field.findById(command._id);

    return newField;
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
      .exec();

    const total: number = await Field.find({}).count();

    return { fields, total };
  },
  deleteFields: async (fieldsIds: mongoose.ObjectId[]): Promise<void> => {
    for (let i = 0; i < fieldsIds.length; i++) {
      await Field.deleteOne({ _id: fieldsIds[i] });
    }

    return null;
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
      .limit(command.paginationCommand.limit);

    const total = await Field.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { fields, total };
  },
  getByIds: async (ids: string[]): Promise<IField[]> => {
    const fields: IField[] = await Field.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    return fields;
  },
  copy: async (ids: string[]): Promise<IField[]> => {
    const fieldsToCopy: IField[] = await fieldRepository.getByIds(ids);

    const promises: Promise<IField>[] = [];

    fieldsToCopy.forEach((field) => {
      promises.push(
        new Promise<IField>(async (resolve, reject) => {
          try {
            const newField: IField = await Field.create({
              name: field.name.map((el) => ({
                language: el.language,
                text: el.text,
              })),
              type: field.type,
              options: field.options.map((option) => ({
                label: option.label.map((el) => ({
                  language: el.language,
                  text: el.text,
                })),
                value: option.value,
              })),
            });

            resolve(newField);
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

export default fieldRepository;
