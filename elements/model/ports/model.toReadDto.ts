import {
  IModelFieldConditionReadDto,
  IModelFieldReadDto,
  IModelReadDto,
} from "roottypes";
import {
  IModelField,
  IModelFieldCondition,
} from "../adapters/model.mongoose.model";
import { fieldToReadDto } from "../../field/ports/field.toReadDto";
import { eventToReadDto } from "../../event/event.toReadDto";
import { modelStateToReadDto } from "../../modelState/modelState.toReadDto";
import IModel from "./interfaces/IModel";

export const modelToReadDto = (
  model: IModel | string
): IModelReadDto | string => {
  if (typeof model === "string" || !model["_id"]) {
    return model.toString();
  }

  return {
    _id: model._id.toString(),
    name: model.name,
    //@ts-ignore
    modelFields: model.modelFields.map((modelField) => {
      return modelFieldToReadDto(modelField);
    }),
    modelEvents: model.modelEvents?.map((e) => eventToReadDto(e)),
    states: model.states?.map((state) => modelStateToReadDto(state)),
    subStates: model.subStates?.map((subState) =>
      modelStateToReadDto(subState)
    ),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
};

export const modelFieldToReadDto = (
  modelField: IModelField
): IModelFieldReadDto => {
  return {
    field: fieldToReadDto(modelField.field),
    required: modelField.required,
    conditions: modelField.conditions?.map((condition) =>
      modelFieldConditionToReadDto(condition)
    ),
    states: modelField.states?.map((s) => modelStateToReadDto(s)),
    mainField: modelField.mainField,
    stickInTable: modelField.stickInTable,
  };
};

export const modelFieldConditionToReadDto = (
  modelFieldCondition: IModelFieldCondition
): IModelFieldConditionReadDto => {
  return {
    field: modelFieldCondition.field
      ? fieldToReadDto(modelFieldCondition.field)
      : undefined,
    conditionType: modelFieldCondition.conditionType,
    value: modelFieldCondition.value,
    modelState: modelFieldCondition.modelState
      ? modelStateToReadDto(modelFieldCondition.modelState)
      : undefined,
  };
};
