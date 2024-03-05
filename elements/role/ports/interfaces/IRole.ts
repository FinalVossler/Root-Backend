import { ITranslatedText, PermissionEnum } from "roottypes";
import { IEntityPermission } from "../../../entityPermission/adapters/entityPermission.mongoose.model";

export default interface IRole {
  _id: string;
  name: ITranslatedText[];
  permissions: PermissionEnum[];
  entityPermissions: (IEntityPermission | string)[];

  createdAt: string;
  updatedAt: string;
}
