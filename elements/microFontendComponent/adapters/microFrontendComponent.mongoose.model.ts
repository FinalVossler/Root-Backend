import mongoose from "mongoose";

import IMicroFrontendComponent from "../ports/interfaces/IMicroFrontendComponent";

interface IMicroFrontendComponentModel
  extends mongoose.Model<IMicroFrontendComponent> {}

const MicroFrontendComponentSchema =
  new mongoose.Schema<IMicroFrontendComponent>(
    {
      name: {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<
  IMicroFrontendComponent,
  IMicroFrontendComponentModel
>("microFrontendComponent", MicroFrontendComponentSchema);
