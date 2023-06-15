import EventCommand from "../../event/dto/EventCommand";
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
  }[];
  modelEvents: EventCommand[];
  states: string[];
  subStates: string[];
  language: string;
};

export default ModelCreateCommand;
