import { ITranslatedText, PermissionEnum } from "roottypes";
import { IEntityPermission } from "../../../entityPermission/entityPermission.model";

export default interface IRole {
  _id: string;
  name: ITranslatedText[];
  permissions: PermissionEnum[];
  entityPermissions: (IEntityPermission | string)[];

  createdAt: string;
  updatedAt: string;
}
