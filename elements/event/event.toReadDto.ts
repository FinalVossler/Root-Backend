import { IEventReadDto } from "roottypes";
import { IEvent } from "./event.model";
import { microFrontendToReadDto } from "../microFontend/microFrontend.toReadDto";
import mongoose from "mongoose";

export const eventToReadDto = (
  event: IEvent | string
): IEventReadDto | string => {
  if (
    typeof event === "string" ||
    mongoose.Types.ObjectId.isValid(event.toString())
  ) {
    return event.toString();
  }

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
