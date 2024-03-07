import mongoose from "mongoose";

import Field from "../../field/adapters/field.mongoose.model";
import { populationOptions } from "../../field/adapters/field.mongoose.repository";
import { IField } from "../../field/ports/interfaces/IField";
import IMicroFrontend from "../ports/interfaces/IMicroFrontend";
import IModel from "../../model/ports/interfaces/IModel";

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
  next();
});

const MicroFrontend = mongoose.model<IMicroFrontend, IMicroFrontendModel>(
  "microFrontend",
  MicroFrontendSchema
);

export default MicroFrontend;
