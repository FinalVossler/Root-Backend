import { IRole } from "../role.model";

type RoleReadDto = {
  _id: IRole["_id"];
  name: IRole["name"];

  createdAt: IRole["createdAt"];
  updatedAt: IRole["updatedAt"];
};

export const toReadDto = (role: IRole): RoleReadDto => {
  return {
    _id: role._id,
    name: role.name,

    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export default RoleReadDto;
