import mongoose from "mongoose";
import EventSchema, { IEvent } from "../event/event.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import Model, { IModel } from "../model/model.model";
import { populationOptions } from "../model/model.repository";

export enum FieldType {
  Number = "Number",
  Text = "Text",
  Paragraph = "Paragraph",
  File = "File",
  Selector = "Selector",
  Button = "Button",
}

export type FieldOption = {
  value: string;
  label: ITranslatedText[];
};

export interface IField {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  type: FieldType;
  options?: FieldOption[];
  fieldEvents: IEvent[];

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
    options: [
      {
        value: mongoose.SchemaTypes.String,
        label: translatedTextSchema,
      },
    ],
    fieldEvents: [EventSchema],
  },
  {
    timestamps: true,
  }
);

// Deleting the fields from the models that are using them
FieldSchema.pre("deleteOne", async function (next) {
  const field: IField = (await this.model.findOne(this.getQuery())) as IField;

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

  next();
});

const model = mongoose.model<IField, IFieldModel>("field", FieldSchema);

export default model;
