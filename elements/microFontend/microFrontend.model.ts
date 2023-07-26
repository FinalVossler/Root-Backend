import mongoose from "mongoose";
import { IMicroFrontendComponent } from "../microFontendComponent/microFrontendComponent.model";

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

export default mongoose.model<IMicroFrontend, IMicroFrontendModel>(
  "microFrontend",
  MicroFrontendSchema
);
