import mongoose from "mongoose";

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
