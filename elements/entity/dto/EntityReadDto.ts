import { IModel } from "../../model/model.model";
import { IEntity } from "../entity.model";

type EntityReadDto = {
  _id: IModel["_id"];
  model: IEntity["model"];
  entityFieldValues: IEntity["entityFieldValues"];
};

export const toReadDto = (entity: IEntity): EntityReadDto => {
  return {
    _id: entity._id,
    model: entity.model,
    entityFieldValues: entity.entityFieldValues,
  };
};

export default EntityReadDto;
