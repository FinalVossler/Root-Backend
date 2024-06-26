import mongoose from "mongoose";

import IModel from "../ports/interfaces/IModel";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import EventSchema from "../../event/adapters/event.mongoose.model";
import { ModelSectionSchema } from "./model.section.mongoose.model";

interface IModelModel extends mongoose.Model<IModel> {}

const ModelSchema = new mongoose.Schema<IModel>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    modelFields: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "field",
          required: false,
        },
        required: {
          type: mongoose.SchemaTypes.Boolean,
        },
        conditions: [
          {
            field: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "field",
              required: false,
            },
            conditionType: {
              type: mongoose.SchemaTypes.String,
            },
            value: {
              type: mongoose.SchemaTypes.String,
              required: false,
            },
            modelState: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "modelState",
            },
          },
        ],
        states: [
          {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "modelState",
          },
        ],
        mainField: {
          type: mongoose.SchemaTypes.Boolean,
          required: false,
        },
        stickInTable: {
          type: mongoose.SchemaTypes.Boolean,
          required: false,
        },
        isVariation: {
          type: mongoose.SchemaTypes.Boolean,
          required: false,
        },
      },
    ],
    modelEvents: [EventSchema],
    states: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "modelState",
      },
    ],
    subStates: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "modelState",
      },
    ],
    showInSideMenu: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
    },
    isForSale: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
    },
    quantityField: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "field",
      required: false,
    },
    priceField: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "field",
      required: false,
    },
    imageField: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "field",
      required: false,
    },
    isForOrders: {
      type: mongoose.SchemaTypes.Boolean,
    },
    orderAssociationConfig: {
      modelOrderAssociationPermission: {
        type: mongoose.SchemaTypes.String,
      },
      modelOrderAssociationLevel: {
        type: mongoose.SchemaTypes.String,
      },
      isList: {
        type: mongoose.SchemaTypes.Boolean,
      },
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
    viewType: {
      type: mongoose.SchemaTypes.String,
    },
    sections: [ModelSectionSchema],
  },
  {
    timestamps: true,
  }
);

const Model = mongoose.model<IModel, IModelModel>("model", ModelSchema);

export default Model;
