import { IModel } from "../../model/model.model";
import { IEntity } from "../entity.model";

type EntityReadDto = {
  _id: IModel["_id"];
  model: IEntity["model"];
  entityFieldValues: IEntity["entityFieldValues"];

  createdAt: IEntity["createdAt"];
  updatedAt: IEntity["updatedAt"];
};

export const toReadDto = (entity: IEntity): EntityReadDto => {
  return {
    _id: entity._id,
    model: entity.model,
    entityFieldValues: entity.entityFieldValues,

    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

export default EntityReadDto;
