import { toReadDto as fieldToReadDto } from "../../field/dto/FieldReadDto";
import { IModel } from "../model.model";

type ModelReadDto = {
  _id: IModel["_id"];
  name: IModel["name"];
  modelFields: IModel["modelFields"];
};

export const toReadDto = (model: IModel): ModelReadDto => {
  return {
    _id: model._id,
    name: model.name,
    modelFields: model.modelFields.map((modelField) => {
      return {
        field: fieldToReadDto(modelField.field),
        required: modelField.required,
      };
    }),
  };
};

export default ModelReadDto;
