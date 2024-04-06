import mongoose from "mongoose";
import { IModelSection } from "roottypes";

export const ModelSectionSchema = new mongoose.Schema({
  direction: { type: mongoose.SchemaTypes.String },
  children: [{ type: mongoose.SchemaTypes.ObjectId, ref: "modelSection " }],
  uuid: { type: mongoose.SchemaTypes.String },
  customData: {
    fieldId: { type: mongoose.SchemaTypes.String },
    required: false,
  },
});

const ModelSection = mongoose.model<IModelSection>(
  "modelSection",
  ModelSectionSchema
);

export default ModelSection;
