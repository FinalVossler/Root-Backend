import { toReadDto as fieldToReadDto } from "../../field/dto/FieldReadDto";
import ModelStateReadDto from "../../modelState/dto/ModelStateReadDto";
import { IModel } from "../model.model";

type ModelReadDto = {
  _id: IModel["_id"];
  name: IModel["name"];
  modelFields: IModel["modelFields"];
  modelEvents?: IModel["modelEvents"];
  states?: ModelStateReadDto[];
  subStates?: ModelStateReadDto[];

  createdAt: IModel["createdAt"];
  updatedAt: IModel["updatedAt"];
};

export const toReadDto = (model: IModel): ModelReadDto => {
  return {
    _id: model._id,
    name: model.name,
    modelFields: model.modelFields.map((modelField) => {
      return {
        field: fieldToReadDto(modelField.field),
        required: modelField.required,
        conditions: modelField.conditions.map((condition) => ({
          field: condition.field ? fieldToReadDto(condition.field) : null,
          conditionType: condition.conditionType,
          value: condition.value,
        })),
        states: modelField.states,
      };
    }),
    modelEvents: model.modelEvents,
    states: model.states,
    subStates: model.subStates,

    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
};

export default ModelReadDto;
