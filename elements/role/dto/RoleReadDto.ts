import { IRole } from "../role.model";

type RoleReadDto = {
  _id: IRole["_id"];
  name: IRole["name"];
  permissions: IRole["permissions"];

  createdAt: IRole["createdAt"];
  updatedAt: IRole["updatedAt"];
};

export const toReadDto = (role?: IRole): RoleReadDto => {
  if (!role) return undefined;
  return {
    _id: role._id,
    name: role.name,
    permissions: role.permissions,

    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export default RoleReadDto;
