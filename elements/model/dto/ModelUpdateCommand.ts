import EventCommand from "../../event/dto/EventCommand";
import ModelStateUpdateCommand from "../../modelState/dto/ModelStateUpdateCommand";
import { ModelFieldConditionTypeEnum } from "../model.model";

type ModelUpdateCommand = {
  _id: string;
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
  }[];
  modelEvents: EventCommand[];
  states: ModelStateUpdateCommand[];
  subStates: ModelStateUpdateCommand[];
  language: string;
};

export default ModelUpdateCommand;
