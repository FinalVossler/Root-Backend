import {
  ModelEventTriggerEnum,
  ModelEventTypeEnum,
  ModelFieldConditionTypeEnum,
} from "../model.model";

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
  modelEvents: {
    eventTrigger: ModelEventTriggerEnum;
    eventType: ModelEventTypeEnum;

    // Redirection options
    redirectionUrl: string;
    redirectionToSelf: boolean;

    // API call options
    requestMethod: string;
    requestUrl: string;
    requestDataIsCreatedEntity: boolean;
    requestData: string;
  }[];
  language: string;
};

export default ModelCreateCommand;
