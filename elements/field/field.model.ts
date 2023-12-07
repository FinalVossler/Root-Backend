import mongoose from "mongoose";

import EventSchema, { IEvent } from "../event/event.model";
import { IFieldTableElement } from "../fieldTableElement/fieldTableElement.model";
import fieldTableElementRepository from "../fieldTableElement/fieldTableElement.repository";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import Model, { IModel } from "../model/model.model";
import { populationOptions } from "../model/model.repository";
import { populationOptions as fieldPopulationOptions } from "../field/field.repository";

export enum FieldType {
  Number = "Number",
  Text = "Text",
  Paragraph = "Paragraph",
  File = "File",
  Selector = "Selector",
  Button = "Button",
  Table = "Table",
  IFrame = "IFrame",
}

export type FieldOption = {
  value: string;
  label: ITranslatedText[];
};

export interface IField {
  _id: mongoose.Types.ObjectId;
  name: ITranslatedText[];
  type: FieldType;
  canChooseFromExistingFiles?: boolean;
  options?: FieldOption[];
  fieldEvents: IEvent[];
  tableOptions?: {
    name?: ITranslatedText[];
    columns: IFieldTableElement[];
    rows: IFieldTableElement[];
    yearTable: boolean;
  };

  createdAt: string;
  updatedAt: string;
}

interface IFieldModel extends mongoose.Model<IField> {}

const FieldSchema = new mongoose.Schema<IField>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    type: {
      type: mongoose.SchemaTypes.String,
      required: true,
      default: FieldType.Text,
    },
    canChooseFromExistingFiles: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
      default: true,
    },
    options: [
      {
        value: mongoose.SchemaTypes.String,
        label: translatedTextSchema,
      },
    ],
    fieldEvents: [EventSchema],
    tableOptions: {
      name: {
        type: translatedTextSchema,
        required: false,
      },
      columns: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "fieldTableElement",
        },
      ],
      rows: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "fieldTableElement",
        },
      ],
      yearTable: {
        type: mongoose.SchemaTypes.Boolean,
      },
    },
  },
  {
    timestamps: true,
  }
);

FieldSchema.pre("deleteOne", async function (next) {
  // Deleting the fields from the models that are using them
  const field: IField = (await this.model
    .findOne(this.getQuery())
    .populate(fieldPopulationOptions)) as IField;

  const models: IModel[] = await Model.find({
    modelFields: { $elemMatch: { field: { _id: field._id } } },
  }).populate(populationOptions);

  const promises: Promise<unknown>[] = [];
  models.forEach((model) => {
    const promise = new Promise(async (resolve, reject) => {
      const newModelFields = model.modelFields.filter(
        (modelField) => modelField.field._id.toString() !== field._id.toString()
      );

      await Model.updateOne(
        { _id: model._id },
        { $set: { modelFields: newModelFields } }
      );

      resolve(null);
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  // Delete field table elements on field deletion
  fieldTableElementRepository.deleteMany(
    (field.tableOptions?.columns.map((c) => c._id.toString()) || []).concat(
      field.tableOptions?.rows?.map((r) => r._id.toString()) || []
    )
  );

  next();
});

const Field = mongoose.model<IField, IFieldModel>("field", FieldSchema);

export default Field;
