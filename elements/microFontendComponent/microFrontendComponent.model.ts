import mongoose from "mongoose";

export interface IMicroFrontendComponent {
  _id: mongoose.Types.ObjectId;
  name: string;

  createdAt: string;
  updatedAt: string;
}

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
