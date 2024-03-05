import { IEventReadDto } from "roottypes";

import { microFrontendToReadDto } from "../../microFontend/ports/microFrontend.toReadDto";
import { IEvent } from "./interfaces/IEvent";

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
