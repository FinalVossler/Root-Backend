import {
  EventTriggerEnum,
  EventTypeEnum,
  IEventRequestHeader,
} from "../../event/event.model";
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
  modelEvents: {
    eventTrigger: EventTriggerEnum;
    eventType: EventTypeEnum;

    // Redirection options
    redirectionUrl: string;
    redirectionToSelf: boolean;

    // API call options
    requestMethod: string;
    requestUrl: string;
    requestDataIsCreatedEntity: boolean;
    requestData: string;
    requestHeaders: IEventRequestHeader[];
  }[];
  language: string;
};

export default ModelCreateCommand;
