import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionRepository from "../entityPermission/entityPermission.repository";
import { PermissionEnum } from "roottypes";
import { populationOptions } from "./role.repository";

export interface IRole {
  _id: string;
  name: ITranslatedText[];
  permissions: PermissionEnum[];
  entityPermissions: (IEntityPermission | string)[];

  createdAt: string;
  updatedAt: string;
}

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

RoleSchema.pre("deleteOne", async function (next) {
  const role: IRole = (await this.model
    .findOne(this.getQuery())
    .populate(populationOptions)) as IRole;

  if (!role) return;

  await entityPermissionRepository.deleteByIds(
    (role.entityPermissions as IEntityPermission[]).map((p) => p._id.toString())
  );

  next();
});

const Role = mongoose.model<IRole, IRoleModel>("role", RoleSchema);

export default Role;
