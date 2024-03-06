import { ITranslatedText, PermissionEnum } from "roottypes";

import IEntityPermission from "../../../entityPermission/ports/interfaces/IEntityPermission";

export default interface IRole {
  _id: string;
  name: ITranslatedText[];
  permissions: PermissionEnum[];
  entityPermissions: (IEntityPermission | string)[];

  createdAt: string;
  updatedAt: string;
}
