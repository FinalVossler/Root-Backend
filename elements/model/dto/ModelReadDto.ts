import FieldReadDto, {
  toReadDto as fieldToReadDto,
} from "../../field/dto/FieldReadDto";
import ModelStateReadDto from "../../modelState/dto/ModelStateReadDto";
import { IModelState } from "../../modelState/modelState.model";
import { IModel, ModelFieldConditionTypeEnum } from "../model.model";

type ModelReadDto = {
  _id: IModel["_id"];
  name: IModel["name"];
  modelFields: {
    field: FieldReadDto;
    required: boolean;
    conditions?: {
      field?: FieldReadDto;
      conditionType: ModelFieldConditionTypeEnum;
      value?: number | string;
      modelState?: IModelState;
    }[];
    states?: IModelState[];
    mainField?: boolean;
  }[];
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
    //@ts-ignore
    modelFields: model.modelFields.map((modelField) => {
      return {
        field: fieldToReadDto(modelField.field),
        required: modelField.required,
        conditions: modelField.conditions?.map((condition) => ({
          field: condition.field ? fieldToReadDto(condition.field) : null,
          conditionType: condition.conditionType,
          value: condition.value,
          modelState: condition.modelState,
        })),
        states: modelField.states,
        mainField: modelField.mainField,
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
