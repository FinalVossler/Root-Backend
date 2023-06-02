import mongoose from "mongoose";

import { IField } from "../field/field.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import Entity from "../entity/entity.model";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionSerivce from "../entityPermission/entityPermission.service";
import entityPermissionRepository from "../entityPermission/entityPermission.repository";

export interface IModel {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  modelFields: IModelField[];
  modelEvents?: IModelEvent[];

  createdAt: string;
  updatedAt: string;
}

//#region model fields
export interface IModelField {
  field: IField;
  required: boolean;
  conditions?: IModelFieldCondition[];
}

export interface IModelFieldCondition {
  field: IField;
  conditionType: ModelFieldConditionTypeEnum;
  value: number | string;
}

export enum ModelFieldConditionTypeEnum {
  SuperiorTo = "SuperiorTo",
  SuperiorOrEqualTo = "SuperiorOrEqualTo",
  InferiorTo = "InferiorTo",
  InferiorOrEqualTo = "InferiorOrEqualTo",
  Equal = "Equal",
  ValueInferiorOrEqualToCurrentYearPlusValueOfFieldAndSuperiorOrEqualToCurrentYear = "ValueInferiorOrEqualToCurrentYearPlusValueOfFieldAndSuperiorOrEqualToCurrentYear",
}
//#endregion model fields

//#region model events
export interface IModelEvent {
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
}

export enum ModelEventTypeEnum {
  ApiCall = "ApiCall",
  Redirection = "Redirection",
}

export enum ModelEventTriggerEnum {
  OnCreate = "OnCreate",
  OnUpdate = "OnUpdate",
}
//#endregion model events

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
            },
          },
        ],
      },
    ],
    modelEvents: [
      {
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
      },
    ],
  },
  {
    timestamps: true,
  }
);

ModelSchema.pre("deleteOne", async function (next) {
  const model: IModel = (await this.model.findOne(this.getQuery())) as IModel;

  // Deleting the entities created based on the deleted model
  await Entity.deleteMany({ model: model._id });

  // Deleting the entities permissions using the deleted model
  const modelEntityPermissions: IEntityPermission[] =
    await entityPermissionSerivce.getModelEntityPermissions(
      model._id.toString()
    );

  await entityPermissionRepository.deleteByIds(
    modelEntityPermissions.map((ep) => ep._id.toString())
  );

  next();
});

const model = mongoose.model<IModel, IModelModel>("model", ModelSchema);

export default model;
