import {
  EventTriggerEnum,
  EventTypeEnum,
  IEventRequestHeader,
} from "../event.model";

type EventCommand = {
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
};

export default EventCommand;
