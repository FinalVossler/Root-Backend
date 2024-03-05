import mongoose from "mongoose";
import IRole from "../ports/interfaces/IRole";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";

interface IRoleModel extends mongoose.Model<IRole> {}

const RoleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    permissions: [
      {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
    ],
    entityPermissions: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "entityPermission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model<IRole, IRoleModel>("role", RoleSchema);

export default Role;
