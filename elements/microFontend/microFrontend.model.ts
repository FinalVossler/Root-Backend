import mongoose from "mongoose";

import { IMicroFrontendComponent } from "../microFontendComponent/microFrontendComponent.model";
import Model, { IModel } from "../model/model.model";
import Field, { IField } from "../field/field.model";
import { populationOptions } from "../field/field.repository";

export interface IMicroFrontend {
  _id: mongoose.Types.ObjectId;
  name: string;
  remoteEntry: string;
  components: IMicroFrontendComponent[];

  createdAt: string;
  updatedAt: string;
}

interface IMicroFrontendModel extends mongoose.Model<IMicroFrontend> {}

const MicroFrontendSchema = new mongoose.Schema<IMicroFrontend>(
  {
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    remoteEntry: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    components: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "microFrontendComponent",
      },
    ],
  },
  {
    timestamps: true,
  }
);

MicroFrontendSchema.pre("deleteOne", async function (next) {
  const microFrontend: IMicroFrontend = (await this.model.findOne(
    this.getQuery()
  )) as IMicroFrontend;

  console.log("micro frontend to delete");

  // Deleting the events created on the basis of this microFrontend for fields
  const fields: IField[] = await Field.find({
    fieldEvents: {
      $elemMatch: {
        microFrontend: { _id: new mongoose.Types.ObjectId(microFrontend._id) },
      },
    },
  }).populate(populationOptions);

  for (let i = 0; i < fields.length; i++) {
    const field: IField = fields[i];
    const newFieldEvents = field.fieldEvents.filter(
      (event) =>
        event.microFrontend._id.toString() !== microFrontend._id.toString()
    );

    console.log("field with this micro Frontend events", field.fieldEvents);
    console.log("newFieldEvents", newFieldEvents);
    console.log("microFrontend._id", microFrontend._id);
    console.log("field._id", field._id);
    await Field.updateOne(
      { _id: field._id },
      { $set: { fieldEvents: newFieldEvents } }
    );
  }

  // Deleting the events created on the basis of this microFrontend for models
  const models: IModel[] = await Model.find({
    modelEvents: {
      $elemMatch: {
        microFrontend: { _id: new mongoose.Types.ObjectId(microFrontend._id) },
      },
    },
  }).populate(populationOptions);

  for (let i = 0; i < models.length; i++) {
    const model: IModel = models[i];
    const newModelEvents = model.modelEvents.filter(
      (event) =>
        event.microFrontend._id.toString() !== microFrontend._id.toString()
    );
    Model.updateOne(
      { _id: model._id },
      { $set: { modelEvents: newModelEvents } }
    );
  }

  next();
});

export default mongoose.model<IMicroFrontend, IMicroFrontendModel>(
  "microFrontend",
  MicroFrontendSchema
);
