import EventCommand from "../../event/dto/EventCommand";
import ModelStateCreateCommand from "../../modelState/dto/ModelStateCreateCommand";
import { ModelFieldConditionTypeEnum } from "../model.model";

type ModelCreateCommand = {
  name: string;
  modelFields: {
    fieldId: string;
    required: boolean;
    conditions?: {
      fieldId: string;
      conditionType: ModelFieldConditionTypeEnum;
      value: number | string;
    }[];
    modelStatesIds: string[];
    mainField: boolean;
  }[];
  modelEvents: EventCommand[];
  states: ModelStateCreateCommand[];
  subStates: ModelStateCreateCommand[];
  language: string;
};

export default ModelCreateCommand;
