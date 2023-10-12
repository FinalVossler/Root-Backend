import { IModel } from "../../model/model.model";
import { IEntity } from "../entity.model";
import UserReadDto, {
  toReadDto as userToReadDto,
} from "../../user/dtos/UserReadDto";

type EntityReadDto = {
  _id: IModel["_id"];
  model: IEntity["model"];
  entityFieldValues: IEntity["entityFieldValues"];
  assignedUsers: UserReadDto[];
  customData?: Object;

  createdAt: IEntity["createdAt"];
  updatedAt: IEntity["updatedAt"];
};

export const toReadDto = (entity: IEntity): EntityReadDto => {
  return {
    _id: entity._id,
    model: entity.model,
    entityFieldValues: entity.entityFieldValues,
    assignedUsers:
      entity.assignedUsers?.map((user) => userToReadDto(user)) || [],
    customData: entity.customData,

    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

export default EntityReadDto;
