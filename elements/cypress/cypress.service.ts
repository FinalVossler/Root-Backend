import Entity from "../entity/entity.model";
import Field, { IField } from "../field/field.model";
import Message from "../message/message.model";
import Page from "../page/page.model";
import Post from "../post/post.model";
import User, { IUser } from "../user/user.model";
import File, { IFile } from "../file/file.model";
import EntityEventNotification from "../entityEventNotification/entityEventNotification.model";
import EntityPermission from "../entityPermission/entityPermission.model";
import FieldTableElement from "../fieldTableElement/fieldTableElement.model";
import Model, {
  IModel,
  ModelFieldConditionTypeEnum,
} from "../model/model.model";
import Role, { IRole } from "../role/role.model";
import ModelState from "../modelState/modelState.model";
import Notification from "../notification/notification.model";
import Reaction from "../reaction/reaction.model";
import Socket from "../socket/socket.model";
import fileRepository from "../file/file.repository";
import fieldRepository from "../field/field.repository";
import MicroFrontend, {
  IMicroFrontend,
} from "../microFontend/microFrontend.model";
import microFrontendRepository from "../microFontend/microFrontend.respository";
import modelRepository from "../model/model.repository";
import { adminUser } from "../../tests/fixtures";
import roleRepository from "../role/role.repository";
import {
  EntityEventNotificationTriggerEnum,
  EventTriggerEnum,
  EventTypeEnum,
  FieldTypeEnum,
  IFieldCreateCommand,
  IFileCommand,
  IMicroFrontendCreateCommand,
  IModelCreateCommand,
  IModelUpdateCommand,
  IRoleCreateCommand,
  ModelStateTypeEnum,
  PermissionEnum,
  StaticPermissionEnum,
} from "roottypes";
import { IMicroFrontendComponent } from "../microFontendComponent/microFrontendComponent.model";

const cypressService = {
  clean: async (currentUser: IUser) => {
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
  prepareMarketMaven: async (currentUser?: IUser) => {
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
        return microFrontendRepository.create(command);
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
      };
      let model: IModel = await modelRepository.create(createCommand);

      const updateCommand: IModelUpdateCommand = {
        _id: model._id.toString(),
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

    await cypressService.clean(currentUser || adminUser);

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
  },
};

export default cypressService;