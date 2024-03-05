import { EventTriggerEnum, EventTypeEnum } from "roottypes";
import { IMicroFrontend } from "../../../microFontend/adapters/microFrontend.mongoose.model";

export interface IEvent {
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

  // Microfrontend redirection
  microFrontend?: IMicroFrontend | string;
  microFrontendComponentId?: string;
}

export interface IEventRequestHeader {
  key: string;
  value: string;
}
