import { faker } from "@faker-js/faker";

import {
  EntityEventNotificationTriggerEnum,
  EventTriggerEnum,
  EventTypeEnum,
  FieldTypeEnum,
  IEntityCreateCommand,
  IFieldCreateCommand,
  IFileCommand,
  IMicroFrontendCreateCommand,
  IModelCreateCommand,
  IModelUpdateCommand,
  IRoleCreateCommand,
  ModelFieldConditionTypeEnum,
  ModelStateTypeEnum,
  PermissionEnum,
  StaticPermissionEnum,
  SuperRoleEnum,
} from "roottypes";

import Field from "../../field/adapters/field.mongoose.model";
import Message from "../../chat/message/adapters/message.mongoose.model";
import Page from "../../page/adapters/page.mongoose.model";
import Post from "../../post/adapters/post.mongoose.model";
import EntityEventNotification from "../../entityEventNotification/adapters/entityEventNotification.mongoose.model";
import EntityPermission from "../../entityPermission/adapters/entityPermission.mongoose.model";
import FieldTableElement from "../../fieldTableElement/adapters/fieldTableElement.mongoose.model";
import Model from "../../model/adapters/model.mongoose.model";
import ModelState from "../../modelState/adapters/modelState.mongoose.model";
import Notification from "../../notification/adapters/notification.mongoose.model";
import Reaction from "../../chat/reaction/adapters/reaction.mongoose.model";
import Socket from "../../socket/adapters/socket.mongoose.model";
import MicroFrontend from "../../microFontend/adapters/microFrontend.mongoose.model";
import User from "../../user/adapters/user.mongoose.model";
import Role from "../../role/adapters/role.mongoose.model";
import Entity from "../../entity/adapters/entity.mongoose.model";
import File from "../../file/adapters/file.mongoose.model";

import microFrontendMongooseRepository from "../../microFontend/adapters/microFrontend.mongoose.respository";
import modelRepository from "../../model/adapters/model.mongoose.repository";
import { adminUser } from "../../../tests/fixtures";
import roleRepository from "../../role/adapters/role.mongoose.repository";
import fileRepository from "../../file/adapters/file.mongoose.repository";
import entityRepository from "../../entity/adapters/entity.mongoose.repository";

import { IField } from "../../field/ports/interfaces/IField";
import IUser from "../../user/ports/interfaces/IUser";
import IModel from "../../model/ports/interfaces/IModel";
import IRole from "../../role/ports/interfaces/IRole";
import IEntity from "../../entity/ports/interfaces/IEntity";
import ITestsPreparationService from "./interfaces/ITestsPreparationService";
import IMicroFrontend from "../../microFontend/ports/interfaces/IMicroFrontend";
import IFile from "../../file/ports/interfaces/IFile";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";
import IFieldRepository from "../../field/ports/interfaces/IFieldRepository";
import IMicroFrontendComponent from "../../microFontendComponent/ports/interfaces/IMicroFrontendComponent";
import Cart from "../../ecommerce/cart/adapters/cart.mongoose.model";
import fieldMongooseRepository from "../../field/adapters/field.mongoose.repository";
import Order from "../../ecommerce/order/adapters/order.mongoose.model";
import fileMongooseRepository from "../../file/adapters/file.mongoose.repository";
import Address from "../../ecommerce/address/adapters/address.mongoose.model";
import entityMongooseRepository from "../../entity/adapters/entity.mongoose.repository";

const createTestsPreparationService = (
  fieldRepository: IFieldRepository
): ITestsPreparationService => ({
  clean: async function (currentUser: IUser) {
    if (currentUser.superRole !== SuperRoleEnum.SuperAdmin) {
      throw new Error("Permission denied");
    }

    await Socket.deleteMany({});

    await File.deleteMany({
      $id: { $ne: (currentUser.profilePicture as IFile)?._id?.toString() },
    });

    await Reaction.deleteMany({});
    await Message.deleteMany({});

    await User.deleteMany({ _id: { $ne: currentUser._id.toString() } });

    await Page.deleteMany({});
    await Post.deleteMany({});

    await Role.deleteMany({});
    await Entity.deleteMany({});
    await EntityPermission.deleteMany({});
    await EntityEventNotification.deleteMany({});

    await Model.deleteMany({});
    await ModelState.deleteMany({});
    await Field.deleteMany({});
    await FieldTableElement.deleteMany({});

    await Notification.deleteMany({});

    await MicroFrontend.deleteMany({});

    await Order.deleteMany({});
    await Cart.deleteMany({});

    await Address.deleteMany({});
  },
  createFile: async (url: string, currentUser: IUser): Promise<IFile> => {
    const file: IFileCommand = {
      isImage: true,
      url,
      uuid: "randomeuuid",
      name: "Test file",
      ownerId: currentUser._id.toString(),
    };
    const createdFile = await fileRepository.create(file);

    return createdFile;
  },
  prepareMarketMaven: async function (currentUser: IUser) {
    if (currentUser.superRole !== SuperRoleEnum.SuperAdmin) {
      throw new Error("Permission denied");
    }

    const prepareMicroFrontends = async (): Promise<{
      forecastMicroFrontend: IMicroFrontend;
      kpisMicroFrontend: IMicroFrontend;
      pestelMicroFrontend: IMicroFrontend;
    }> => {
      const forecastCommand: IMicroFrontendCreateCommand = {
        name: "forecast",
        remoteEntry: "http://localhost:3003/remoteEntry.js",
        components: [
          {
            name: "Forecast",
          },
        ],
      };

      const kpisCommand: IMicroFrontendCreateCommand = {
        name: "kpis",
        remoteEntry: "http://localhost:3002/remoteEntry.js",
        components: [
          {
            name: "KPIs",
          },
        ],
      };

      const pestelCommand: IMicroFrontendCreateCommand = {
        name: "pestel",
        remoteEntry: "http://localhost:3001/remoteEntry.js",
        components: [
          {
            name: "Pestel",
          },
        ],
      };

      const promises: Promise<IMicroFrontend>[] = [
        forecastCommand,
        kpisCommand,
        pestelCommand,
      ].map((command) => {
        return microFrontendMongooseRepository.create(command);
      });

      const result = await Promise.all(promises);

      return {
        forecastMicroFrontend: result[0],
        kpisMicroFrontend: result[1],
        pestelMicroFrontend: result[2],
      };
    };

    const prepareFields = async () => {
      const { pestelMicroFrontend, forecastMicroFrontend, kpisMicroFrontend } =
        await prepareMicroFrontends();
      const caseNameCommand: IFieldCreateCommand = {
        name: "Case Name",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.Text,
      };

      const productNameCommand: IFieldCreateCommand = {
        name: "Product Name",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.Text,
      };

      const countryCommand: IFieldCreateCommand = {
        name: "Country",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        options: [
          {
            label: "France",
            value: "france",
          },
          {
            label: "Tunisia",
            value: "tunisia",
          },
          {
            label: "United States",
            value: "united-states",
          },
        ],
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.Selector,
      };

      const numberOfYearsOfForecastCommand: IFieldCreateCommand = {
        name: "Number of years of Forecast",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.Number,
      };

      const medicalInsightsPPTemplateCommand: IFieldCreateCommand = {
        name: "Medical insight PPT template",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.File,
      };

      const inMarketSalesDataCommand: IFieldCreateCommand = {
        name: "In Market Sales Data",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: false,
        },
        type: FieldTypeEnum.File,
      };

      const priceCommand: IFieldCreateCommand = {
        name: "Price",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "Price",
          rows: [
            {
              language: "en",
              name: "Value",
            },
          ],
          yearTable: true,
        },
        type: FieldTypeEnum.Table,
      };

      const costCommand: IFieldCreateCommand = {
        name: "Cost",
        canChooseFromExistingFiles: false,
        fieldEvents: [],
        language: "en",
        tableOptions: {
          columns: [],
          name: "Cost",
          rows: [
            {
              language: "en",
              name: "Value",
            },
          ],
          yearTable: true,
        },
        type: FieldTypeEnum.Table,
      };

      const kpiDashboardButtonCommand: IFieldCreateCommand = {
        name: "KPI Dashboard",
        canChooseFromExistingFiles: false,
        fieldEvents: [
          {
            eventTrigger: EventTriggerEnum.OnClick,
            eventType: EventTypeEnum.MicroFrontendRedirection,
            redirectionToSelf: false,
            redirectionUrl: "",
            requestData: "",
            requestDataIsCreatedEntity: false,
            requestHeaders: [],
            requestMethod: "",
            requestUrl: "",
            microFrontendComponentId: (
              kpisMicroFrontend.components[0] as IMicroFrontendComponent
            )._id.toString(),
            microFrontendId: kpisMicroFrontend._id.toString(),
          },
        ],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: true,
        },
        type: FieldTypeEnum.Button,
      };

      const pestelButtonCommand: IFieldCreateCommand = {
        name: "PESTEL Analysis",
        canChooseFromExistingFiles: false,
        fieldEvents: [
          {
            eventTrigger: EventTriggerEnum.OnClick,
            eventType: EventTypeEnum.MicroFrontendRedirection,
            redirectionToSelf: false,
            redirectionUrl: "",
            requestData: "",
            requestDataIsCreatedEntity: false,
            requestHeaders: [],
            requestMethod: "",
            requestUrl: "",
            microFrontendComponentId: (
              pestelMicroFrontend.components[0] as IMicroFrontendComponent
            )._id.toString(),
            microFrontendId: pestelMicroFrontend._id.toString(),
          },
        ],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: true,
        },
        type: FieldTypeEnum.Button,
      };

      const forecastButtonCommand: IFieldCreateCommand = {
        name: "Forecast",
        canChooseFromExistingFiles: false,
        fieldEvents: [
          {
            eventTrigger: EventTriggerEnum.OnClick,
            eventType: EventTypeEnum.MicroFrontendRedirection,
            redirectionToSelf: false,
            redirectionUrl: "",
            requestData: "",
            requestDataIsCreatedEntity: false,
            requestHeaders: [],
            requestMethod: "",
            requestUrl: "",
            microFrontendComponentId: (
              forecastMicroFrontend.components[0] as IMicroFrontendComponent
            )._id.toString(),
            microFrontendId: forecastMicroFrontend._id.toString(),
          },
        ],
        language: "en",
        tableOptions: {
          columns: [],
          name: "",
          rows: [],
          yearTable: true,
        },
        type: FieldTypeEnum.Button,
      };

      const fieldCreationPromises: Promise<IField>[] = [
        caseNameCommand,
        productNameCommand,
        countryCommand,
        numberOfYearsOfForecastCommand,
        medicalInsightsPPTemplateCommand,
        inMarketSalesDataCommand,
        priceCommand,
        costCommand,
        kpiDashboardButtonCommand,
        pestelButtonCommand,
        forecastButtonCommand,
      ].map((command) => {
        return fieldRepository.create(command);
      });

      const fields = await Promise.all(fieldCreationPromises);
      const caseNameField = fields[0];
      const productNameField = fields[1];
      const countryField = fields[2];
      const numberOfYearsOfForecastField = fields[3];
      const medicalInsightPPTemplateField = fields[4];
      const inMarketSalesDataField = fields[5];
      const priceField = fields[6];
      const costField = fields[7];
      const kpiDashboardButtonField = fields[8];
      const pestelButtonField = fields[9];
      const forecastButtonField = fields[10];

      return {
        caseNameField,
        productNameField,
        countryField,
        numberOfYearsOfForecastField,
        medicalInsightPPTemplateField,
        inMarketSalesDataField,
        priceField,
        costField,
        kpiDashboardButtonField,
        pestelButtonField,
        forecastButtonField,
      };
    };

    const prepareModels = async (): Promise<IModel> => {
      const createCommand: IModelCreateCommand = {
        language: "en",
        modelEvents: [],
        name: "Case",
        modelFields: [],
        states: [
          {
            exclusive: false,
            language: "en",
            name: "Market Data",
            stateType: ModelStateTypeEnum.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for inputs (Cost, Price, Medical Insights)",
            stateType: ModelStateTypeEnum.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for forecast",
            stateType: ModelStateTypeEnum.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for business case",
            stateType: ModelStateTypeEnum.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Complete",
            stateType: ModelStateTypeEnum.ParentState,
          },
        ],
        subStates: [
          {
            exclusive: false,
            language: "en",
            name: "Price",
            stateType: ModelStateTypeEnum.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Cost",
            stateType: ModelStateTypeEnum.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Medical Insights",
            stateType: ModelStateTypeEnum.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "KPIs Completed",
            stateType: ModelStateTypeEnum.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Pestel Completed",
            stateType: ModelStateTypeEnum.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Product Forecast",
            stateType: ModelStateTypeEnum.SubState,
          },
        ],
        isForSale: false,
      };
      let model: IModel = await modelRepository.create(createCommand);

      const updateCommand: IModelUpdateCommand = {
        _id: model._id.toString(),
        isForSale: false,
        language: "en",
        modelEvents: [],
        name: model.name?.at(0)?.text || "",
        states:
          model.states?.map((s) => ({
            _id: s._id?.toString(),
            exclusive: Boolean(s.exlusive),
            language: "en",
            name: s.name.at(0)?.text || "",
            stateType: s.stateType,
          })) || [],
        subStates:
          model.subStates?.map((s) => ({
            _id: s._id?.toString(),
            exclusive: Boolean(s.exlusive),
            language: "en",
            name: s.name.at(0)?.text || "",
            stateType: s.stateType,
          })) || [],
        modelFields: [
          {
            fieldId: caseNameField._id.toString(),
            mainField: true,
            stickInTable: true,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
            ],
            required: true,
            conditions: [],
          },
          {
            fieldId: productNameField._id.toString(),
            mainField: true,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
            ],
            required: true,
            conditions: [],
          },
          {
            fieldId: countryField._id.toString(),
            mainField: true,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
            ],
            required: true,
            conditions: [],
          },
          {
            fieldId: numberOfYearsOfForecastField._id.toString(),
            mainField: true,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
            ],
            required: true,
            conditions: [],
          },
          {
            fieldId: costField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "Cost")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [
              {
                conditionType:
                  ModelFieldConditionTypeEnum.IfYearTableThenNumberOfYearsInTheFutureIsEqualToValueOfField,
                fieldId: numberOfYearsOfForecastField._id.toString(),
                value: "",
              },
            ],
          },
          {
            fieldId: priceField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "Price")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [
              {
                conditionType:
                  ModelFieldConditionTypeEnum.IfYearTableThenNumberOfYearsInTheFutureIsEqualToValueOfField,
                fieldId: numberOfYearsOfForecastField._id.toString(),
                value: "",
              },
            ],
          },
          {
            fieldId: inMarketSalesDataField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
              model.states
                ?.find(
                  (s) =>
                    s.name.at(0)?.text ===
                    "Ready for inputs (Cost, Price, Medical Insights)"
                )
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [],
          },
          {
            fieldId: medicalInsightPPTemplateField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.states
                ?.find((s) => s.name.at(0)?.text === "Ready for business case")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "Medical Insights")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [],
          },
          {
            fieldId: kpiDashboardButtonField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "KPIs Completed")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [
              {
                conditionType: ModelFieldConditionTypeEnum.StateConditionsMet,
                modelStateId: model.states
                  ?.find(
                    (s) =>
                      s.name.at(0)?.text ===
                      "Ready for inputs (Cost, Price, Medical Insights)"
                  )
                  ?._id.toString(),
                fieldId: "",
                value: "",
              },
            ],
          },
          {
            fieldId: pestelButtonField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "Pestel Completed")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [
              {
                conditionType: ModelFieldConditionTypeEnum.StateConditionsMet,
                modelStateId: model.states
                  ?.find((s) => s.name.at(0)?.text === "Ready for forecast")
                  ?._id.toString(),
                fieldId: "",
                value: "",
              },
            ],
          },
          {
            fieldId: forecastButtonField._id.toString(),
            mainField: false,
            stickInTable: false,
            modelStatesIds: [
              model.states
                ?.find((s) => s.name.at(0)?.text === "Complete")
                ?._id.toString() || "",
              model.subStates
                ?.find((s) => s.name.at(0)?.text === "Product Forecast")
                ?._id.toString() || "",
            ],
            required: false,
            conditions: [
              {
                conditionType: ModelFieldConditionTypeEnum.StateConditionsMet,
                modelStateId: model.states
                  ?.find(
                    (s) => s.name.at(0)?.text === "Ready for business case"
                  )
                  ?._id.toString(),
                fieldId: "",
                value: "",
              },
            ],
          },
        ],
      };

      model = await modelRepository.update(updateCommand);

      return model;
    };

    const prepareRoles = async () => {
      const priceRoleCreateCommand: IRoleCreateCommand = {
        language: "en",
        name: "Pricing Team",
        permissions: [PermissionEnum.ReadUser, PermissionEnum.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [
              StaticPermissionEnum.Read,
              StaticPermissionEnum.Update,
            ],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [],
              },
              {
                fieldId: kpiDashboardButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: pestelButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: forecastButtonField._id.toString(),
                permissions: [],
              },
            ],
            entityEventNotifications: [
              {
                language: "en",
                text: "Your input on pricing is needed",
                title: "A case was assigned to you",
                trigger: EntityEventNotificationTriggerEnum.OnAssigned,
              },
            ],
          },
        ],
      };
      const costRoleCreateCommand: IRoleCreateCommand = {
        language: "en",
        name: "Controlling Team",
        permissions: [PermissionEnum.ReadUser, PermissionEnum.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [
              StaticPermissionEnum.Read,
              StaticPermissionEnum.Update,
            ],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [],
              },
              {
                fieldId: kpiDashboardButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: pestelButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: forecastButtonField._id.toString(),
                permissions: [],
              },
            ],
            entityEventNotifications: [
              {
                language: "en",
                text: "Your input on costing is needed",
                title: "A case was assigned to you",
                trigger: EntityEventNotificationTriggerEnum.OnAssigned,
              },
            ],
          },
        ],
      };
      const medicalInsightRoleCreateCommand: IRoleCreateCommand = {
        language: "en",
        name: "Medical Insight Team",
        permissions: [PermissionEnum.ReadUser, PermissionEnum.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [
              StaticPermissionEnum.Read,
              StaticPermissionEnum.Update,
            ],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },
              {
                fieldId: kpiDashboardButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: pestelButtonField._id.toString(),
                permissions: [],
              },

              {
                fieldId: forecastButtonField._id.toString(),
                permissions: [],
              },
            ],
            entityEventNotifications: [
              {
                language: "en",
                text: "Your medical insight input is needed",
                title: "A case was assigned to you",
                trigger: EntityEventNotificationTriggerEnum.OnAssigned,
              },
            ],
          },
        ],
      };
      const marketingTeamCreateCommand: IRoleCreateCommand = {
        language: "en",
        name: "Marketing Team",
        permissions: [PermissionEnum.ReadUser, PermissionEnum.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [
              StaticPermissionEnum.Read,
              StaticPermissionEnum.Update,
              StaticPermissionEnum.Create,
              StaticPermissionEnum.Delete,
            ],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [StaticPermissionEnum.Read],
              },
              {
                fieldId: kpiDashboardButtonField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: pestelButtonField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },

              {
                fieldId: forecastButtonField._id.toString(),
                permissions: [
                  StaticPermissionEnum.Read,
                  StaticPermissionEnum.Update,
                ],
              },
            ],
            entityEventNotifications: [],
          },
        ],
      };
      const priceRole: IRole = await roleRepository.create(
        priceRoleCreateCommand
      );
      const costRole: IRole = await roleRepository.create(
        costRoleCreateCommand
      );
      const medicalInsightRole: IRole = await roleRepository.create(
        medicalInsightRoleCreateCommand
      );
      const marketingRole: IRole = await roleRepository.create(
        marketingTeamCreateCommand
      );

      const headOfMarketingTeamCreateCommand: IRoleCreateCommand = {
        ...marketingTeamCreateCommand,
        name: "Head of Marketing team",
        entityPermissions: [
          {
            ...marketingTeamCreateCommand.entityPermissions[0],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [
                priceRole._id.toString(),
                costRole._id.toString(),
                medicalInsightRole._id.toString(),
              ],
            },
          },
        ],
      };
      const headOfMarketingRole: IRole = await roleRepository.create(
        headOfMarketingTeamCreateCommand
      );

      return {
        priceRole,
        costRole,
        medicalInsightRole,
        marketingRole,
        headOfMarketingRole,
      };
    };

    const prepareFiles = async (): Promise<{
      caseFile: IFile;
      medicalInsightFile: IFile;
    }> => {
      const command: IFileCommand = {
        isImage: false,
        url: "https://www.africau.edu/images/default/sample.pdf",
        uuid: "random",
        name: "Case molecules",
        ownerId: adminUser._id,
      };
      const caseFile: IFile = await fileRepository.create(command);
      const medicalInsightFile: IFile = await fileRepository.create({
        ...command,
        name: "Medical insight",
      });

      return { caseFile, medicalInsightFile };
    };

    const prepareEntities = async () => {
      const promises: Promise<IEntity>[] = [];
      Array.from({ length: 3 }).forEach((_) => {
        const numberOfYearsOfForecast: number = Math.floor(Math.random() * 10);
        const command: IEntityCreateCommand = {
          assignedUsersIds: [],
          entityFieldValues: [
            {
              fieldId: caseNameField._id.toString(),
              files: [],
              tableValues: [],
              value: faker.company.name(),
              yearTableValues: [],
            },
            {
              fieldId: productNameField._id.toString(),
              files: [],
              tableValues: [],
              value: faker.commerce.product(),
              yearTableValues: [],
            },
            {
              fieldId: countryField._id.toString(),
              files: [],
              tableValues: [],
              value: "en",
              yearTableValues: [],
            },
            {
              fieldId: numberOfYearsOfForecastField._id.toString(),
              files: [],
              tableValues: [],
              value: numberOfYearsOfForecast + "",
              yearTableValues: [],
            },
            {
              fieldId: medicalInsightPPTemplateField._id.toString(),
              files: [
                {
                  _id:
                    medicalInsightFile && medicalInsightFile._id
                      ? medicalInsightFile?._id.toString()
                      : "",
                  ...medicalInsightFile,
                },
              ],
              tableValues: [],
              value: "",
              yearTableValues: [],
            },
            {
              fieldId: inMarketSalesDataField._id.toString(),
              files: [
                {
                  _id:
                    inMarketSalesDataFile && inMarketSalesDataFile._id
                      ? inMarketSalesDataFile?._id.toString()
                      : "",
                  ...inMarketSalesDataFile,
                },
              ],
              tableValues: [],
              value: "",
              yearTableValues: [],
            },
            {
              fieldId: priceField._id.toString(),
              files: [],
              tableValues: [],
              value: "",
              yearTableValues:
                priceField.tableOptions?.rows.map((row) => ({
                  rowId: (row as IFieldTableElement)._id.toString(),
                  values:
                    Array.from({ length: numberOfYearsOfForecast }).map(
                      (_, columnIndex) => ({
                        year: 2025 + columnIndex,
                        value: Math.floor(Math.random() * 100) + "",
                      })
                    ) || [],
                })) || [],
            },
            {
              fieldId: costField._id.toString(),
              files: [],
              tableValues: [],
              value: "",
              yearTableValues:
                costField.tableOptions?.rows.map((row) => ({
                  rowId: (row as IFieldTableElement)._id.toString(),
                  values:
                    Array.from({ length: numberOfYearsOfForecast }).map(
                      (_, columnIndex) => ({
                        year: 2025 + columnIndex,
                        value: Math.floor(Math.random() * 100) + "",
                      })
                    ) || [],
                })) || [],
            },
            {
              fieldId: kpiDashboardButtonField._id.toString(),
              files: [],
              tableValues: [],
              value: "",
              yearTableValues: [],
            },
            {
              fieldId: pestelButtonField._id.toString(),
              files: [],
              tableValues: [],
              value: "",
              yearTableValues: [],
            },
            {
              fieldId: forecastButtonField._id.toString(),
              files: [],
              tableValues: [],
              value: "",
              yearTableValues: [],
            },
          ],
          language: "en",
          modelId: model._id.toString(),
        };

        promises.push(
          entityRepository.create(command, adminUser._id.toString())
        );
      });

      await Promise.all(promises);
    };

    await this.clean(currentUser || adminUser);

    const {
      caseNameField,
      productNameField,
      countryField,
      numberOfYearsOfForecastField,
      medicalInsightPPTemplateField,
      inMarketSalesDataField,
      priceField,
      costField,
      kpiDashboardButtonField,
      pestelButtonField,
      forecastButtonField,
    } = await prepareFields();

    const model = await prepareModels();
    await prepareRoles();
    const { caseFile: inMarketSalesDataFile, medicalInsightFile } =
      await prepareFiles();
    await prepareEntities();
  },
  perpareEcommerce: async function (currentUser: IUser) {
    await this.clean(currentUser);
    const productNameFieldCreateCommand: IFieldCreateCommand = {
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Name",
      tableOptions: {
        columns: [],
        rows: [],
        name: "",
        yearTable: false,
      },
      type: FieldTypeEnum.Text,
      options: [],
    };
    const priceFieldCreateCommand: IFieldCreateCommand = {
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Price",
      tableOptions: {
        columns: [],
        rows: [],
        name: "",
        yearTable: false,
      },
      type: FieldTypeEnum.Number,
      options: [],
    };

    const quantityFieldCreateCommand: IFieldCreateCommand = {
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Quantity",
      tableOptions: {
        columns: [],
        rows: [],
        name: "",
        yearTable: false,
      },
      type: FieldTypeEnum.Number,
      options: [],
    };

    const descriptionFieldCreateCommand: IFieldCreateCommand = {
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Description",
      tableOptions: {
        columns: [],
        rows: [],
        name: "",
        yearTable: false,
      },
      type: FieldTypeEnum.Paragraph,
      options: [],
    };

    const imageFieldCreateCommand: IFieldCreateCommand = {
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Image",
      tableOptions: {
        columns: [],
        rows: [],
        name: "",
        yearTable: false,
      },
      type: FieldTypeEnum.File,
      options: [],
    };

    const productNameField: IField = await fieldMongooseRepository.create(
      productNameFieldCreateCommand
    );
    const descriptionField: IField = await fieldMongooseRepository.create(
      descriptionFieldCreateCommand
    );
    const priceField: IField = await fieldMongooseRepository.create(
      priceFieldCreateCommand
    );
    const quantityField: IField = await fieldMongooseRepository.create(
      quantityFieldCreateCommand
    );
    const imageField: IField = await fieldMongooseRepository.create(
      imageFieldCreateCommand
    );

    const productModelCreateCommand: IModelCreateCommand = {
      isForSale: true,
      language: "en",
      modelEvents: [],
      modelFields: [
        {
          fieldId: productNameField._id,
          mainField: true,
          modelStatesIds: [],
          required: true,
          stickInTable: true,
          conditions: [],
        },
        {
          fieldId: priceField._id,
          mainField: true,
          modelStatesIds: [],
          required: true,
          stickInTable: false,
          conditions: [],
        },
        {
          fieldId: quantityField._id,
          mainField: true,
          modelStatesIds: [],
          required: true,
          stickInTable: false,
          conditions: [],
        },
        {
          fieldId: descriptionField._id,
          mainField: false,
          modelStatesIds: [],
          required: true,
          stickInTable: false,
          conditions: [],
        },
        {
          fieldId: imageField._id,
          mainField: false,
          modelStatesIds: [],
          required: false,
          stickInTable: false,
          conditions: [],
        },
      ],
      priceFieldId: priceField._id.toString(),
      quantityFieldId: quantityField._id.toString(),
      imageFieldId: imageField._id.toString(),
      name: "Product",
      states: [],
      subStates: [],
    };

    const sellableModel = await modelRepository.create(
      productModelCreateCommand
    );

    const blueShirtImage: IFile = await fileMongooseRepository.create({
      isImage: true,
      url: "https://ucarecdn.com/510103cd-c25f-4194-a39a-30ec731cae61/",
      uuid: "510103cd-c25f-4194-a39a-30ec731cae61",
      name: "61wCwQKBqpL_AC_UY1000_.jpg",
    });
    const greenShirtImage: IFile = await fileMongooseRepository.create({
      isImage: true,
      url: "https://ucarecdn.com/57694474-526e-4103-9562-1f7b44265319/31JauF3aIL_AC_UY1000_.jpg",
      uuid: "510103cd-c25f-4194-a39a-30ec731cae62",
      name: "31Ja-uF3aIL._AC_UY1000_.jpg",
    });

    const product1CreateCommand: IEntityCreateCommand = {
      assignedUsersIds: [],
      language: "en",
      modelId: sellableModel._id.toString(),
      entityFieldValues: [
        {
          fieldId: priceField._id.toString(),
          files: [],
          tableValues: [],
          value: "20",
          yearTableValues: [],
        },
        {
          fieldId: quantityField._id.toString(),
          files: [],
          tableValues: [],
          value: "50",
          yearTableValues: [],
        },
        {
          fieldId: descriptionField._id.toString(),
          files: [],
          tableValues: [],
          value: "Just a blue shirt. I hope you like it :)",
          yearTableValues: [],
        },
        {
          fieldId: productNameField._id.toString(),
          files: [],
          tableValues: [],
          value: "Blue shirt",
          yearTableValues: [],
        },
        {
          fieldId: imageField._id.toString(),
          files: [
            {
              isImage: true,
              url: "https://ucarecdn.com/510103cd-c25f-4194-a39a-30ec731cae61/",
              uuid: "510103cd-c25f-4194-a39a-30ec731cae61",
              name: "61wCwQKBqpL_AC_UY1000_.jpg",
              _id: blueShirtImage._id?.toString(),
            },
          ],
          tableValues: [],
          value: "20",
          yearTableValues: [],
        },
      ],
    };
    const product2CreateCommand: IEntityCreateCommand = {
      assignedUsersIds: [],
      language: "en",
      modelId: sellableModel._id.toString(),
      entityFieldValues: [
        {
          fieldId: priceField._id.toString(),
          files: [],
          tableValues: [],
          value: "30",
          yearTableValues: [],
        },
        {
          fieldId: quantityField._id.toString(),
          files: [],
          tableValues: [],
          value: "10",
          yearTableValues: [],
        },
        {
          fieldId: descriptionField._id.toString(),
          files: [],
          tableValues: [],
          value: "Just a green shirt. I hope you like it :)",
          yearTableValues: [],
        },
        {
          fieldId: productNameField._id.toString(),
          files: [],
          tableValues: [],
          value: "Green shirt",
          yearTableValues: [],
        },
        {
          fieldId: imageField._id.toString(),
          files: [
            {
              isImage: true,
              url: "https://ucarecdn.com/57694474-526e-4103-9562-1f7b44265319/31JauF3aIL_AC_UY1000_.jpg",
              uuid: "510103cd-c25f-4194-a39a-30ec731cae62",
              name: "31Ja-uF3aIL._AC_UY1000_.jpg",
              _id: greenShirtImage._id?.toString(),
            },
          ],
          tableValues: [],
          value: "20",
          yearTableValues: [],
        },
      ],
    };

    await entityMongooseRepository.create(product1CreateCommand, adminUser._id);
    await entityMongooseRepository.create(product2CreateCommand, adminUser._id);
  },
});

export default createTestsPreparationService;
