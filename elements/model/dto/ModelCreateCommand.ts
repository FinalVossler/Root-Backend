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
  language: string;
};

export default ModelCreateCommand;
