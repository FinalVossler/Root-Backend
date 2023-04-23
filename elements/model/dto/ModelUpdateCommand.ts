import { ModelFieldConditionType } from "../model.model";

type ModelUpdateCommand = {
  _id: string;
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

export default ModelUpdateCommand;
