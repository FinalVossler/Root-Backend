import {
  IModelFieldConditionReadDto,
  IModelFieldReadDto,
  IModelReadDto,
} from "roottypes";

import { fieldToReadDto } from "../../field/ports/field.toReadDto";
import { eventToReadDto } from "../../event/ports/event.toReadDto";
import { modelStateToReadDto } from "../../modelState/ports/modelState.toReadDto";
import IModel, { IModelField, IModelFieldCondition } from "./interfaces/IModel";
import { userToReadDto } from "../../user/ports/user.toReadDto";

export const modelToReadDto = (
  model: IModel | string
): IModelReadDto | string => {
  if (typeof model === "string" || Object.keys(model).length === 0) {
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

    showInSideMenu: model.showInSideMenu,
    isForSale: Boolean(model.isForSale),
    quantityField:
      model.quantityField !== undefined
        ? fieldToReadDto(model.quantityField)
        : undefined,
    priceField:
      model.priceField !== undefined
        ? fieldToReadDto(model.priceField)
        : undefined,
    imageField:
      model.imageField !== undefined
        ? fieldToReadDto(model.imageField)
        : undefined,
    isForOrders: Boolean(model.isForOrders),
    orderAssociationConfig: model.orderAssociationConfig,

    owner: model.owner ? userToReadDto(model.owner) : undefined,
    sections: model.sections || [],
    viewType: model.viewType,

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
    isVariation: Boolean(modelField.isVariation),
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
