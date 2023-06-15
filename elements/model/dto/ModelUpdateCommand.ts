import EventCommand from "../../event/dto/EventCommand";
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
  }[];
  modelEvents: EventCommand[];
  states: string[];
  subStates: string[];
  language: string;
};

export default ModelUpdateCommand;
