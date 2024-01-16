import mongoose from "mongoose";
import { IMicroFrontend } from "../microFontend/microFrontend.model";
import { EventTriggerEnum, EventTypeEnum } from "roottypes";

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

const EventSchema = new mongoose.Schema({
  eventTrigger: {
    type: mongoose.SchemaTypes.String,
  },
  eventType: {
    type: mongoose.SchemaTypes.String,
  },
  redirectionUrl: {
    type: mongoose.SchemaTypes.String,
  },
  redirectionToSelf: {
    type: mongoose.SchemaTypes.Boolean,
  },
  requestMethod: {
    type: mongoose.SchemaTypes.String,
  },
  requestUrl: {
    type: mongoose.SchemaTypes.String,
  },
  requestDataIsCreatedEntity: {
    type: mongoose.SchemaTypes.Boolean,
  },
  requestData: {
    type: mongoose.SchemaTypes.String,
  },
  requestHeaders: [
    {
      key: {
        type: mongoose.SchemaTypes.String,
      },
      value: {
        type: mongoose.SchemaTypes.String,
      },
    },
  ],
  microFrontend: {
    type: mongoose.SchemaTypes.ObjectId,
    required: false,
  },
  microFrontendComponentId: {
    type: mongoose.SchemaTypes.String,
  },
});

export default EventSchema;
