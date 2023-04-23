import { ModelFieldConditionType } from "../model.model";

type ModelCreateCommand = {
  name: string;
  modelFields: {
    fieldId: string;
    required: boolean;
    conditions?: {
      fieldId: string;
      conditionType: ModelFieldConditionType;
      value: number | string;
    }[];
  }[];
  language: string;
};

export default ModelCreateCommand;
