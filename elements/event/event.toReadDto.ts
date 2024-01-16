import { IEventReadDto } from "roottypes";
import { IEvent } from "./event.model";
import { microFrontendToReadDto } from "../microFontend/microFrontend.toReadDto";

export const eventToReadDto = (event: IEvent): IEventReadDto => {
  return {
    eventTrigger: event.eventTrigger,
    eventType: event.eventType,
    redirectionToSelf: event.redirectionToSelf,
    redirectionUrl: event.redirectionUrl,
    requestData: event.requestData,
    requestDataIsCreatedEntity: event.requestDataIsCreatedEntity,
    requestHeaders: event.requestHeaders,
    requestMethod: event.requestMethod,
    requestUrl: event.requestUrl,
    microFrontend: event.microFrontend
      ? microFrontendToReadDto(event.microFrontend)
      : undefined,
    microFrontendComponentId: event.microFrontendComponentId,
  };
};
