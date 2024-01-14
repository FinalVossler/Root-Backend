import Entity from "../entity/entity.model";
import Field, { FieldType, IField } from "../field/field.model";
import Message from "../message/message.model";
import Page from "../page/page.model";
import Post from "../post/post.model";
import User, { IUser } from "../user/user.model";
import File, { IFile } from "../file/file.model";
import EntityEventNotification, {
  EntityEventNotificationTrigger,
} from "../entityEventNotification/entityEventNotification.model";
import EntityPermission, {
  StaticPermission,
} from "../entityPermission/entityPermission.model";
import FieldTableElement from "../fieldTableElement/fieldTableElement.model";
import Model, {
  IModel,
  ModelFieldConditionTypeEnum,
} from "../model/model.model";
import Role, { IRole, Permission } from "../role/role.model";
import ModelState, { ModelStateType } from "../modelState/modelState.model";
import Notification from "../notification/notification.model";
import Reaction from "../reaction/reaction.model";
import Socket from "../socket/socket.model";
import fileRepository from "../file/file.repository";
import FieldCreateCommand from "../field/dto/FieldCreateCommand";
import { EventTriggerEnum, EventTypeEnum } from "../event/event.model";
import fieldRepository from "../field/field.repository";
import MicroFrontendCreateCommand from "../microFontend/dto/MicroFrontendCreateCommand";
import MicroFrontend, {
  IMicroFrontend,
} from "../microFontend/microFrontend.model";
import microFrontendRepository from "../microFontend/microFrontend.respository";
import ModelCreateCommand from "../model/dto/ModelCreateCommand";
import modelRepository from "../model/model.repository";
import ModelUpdateCommand from "../model/dto/ModelUpdateCommand";
import { adminUser } from "../../tests/fixtures";
import RoleCreateCommand from "../role/dto/RoleCreateCommand";
import roleRepository from "../role/role.repository";

const cypressService = {
  clean: async (currentUser: IUser) => {
    await Socket.deleteMany({});

    await File.deleteMany({
      $id: { $ne: currentUser.profilePicture?._id?.toString() },
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
    const file: IFile = {
      isImage: true,
      url,
      uuid: "randomeuuid",
      name: "Test file",
      ownerId: currentUser._id,
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
      const forecastCommand: MicroFrontendCreateCommand = {
        name: "forecast",
        remoteEntry: "http://localhost:3003/remoteEntry.js",
        components: [
          {
            name: "Forecast",
          },
        ],
      };

      const kpisCommand: MicroFrontendCreateCommand = {
        name: "kpis",
        remoteEntry: "http://localhost:3002/remoteEntry.js",
        components: [
          {
            name: "KPIs",
          },
        ],
      };

      const pestelCommand: MicroFrontendCreateCommand = {
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
      const caseNameCommand: FieldCreateCommand = {
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
        type: FieldType.Text,
      };

      const productNameCommand: FieldCreateCommand = {
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
        type: FieldType.Text,
      };

      const countryCommand: FieldCreateCommand = {
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
        type: FieldType.Selector,
      };

      const numberOfYearsOfForecastCommand: FieldCreateCommand = {
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
        type: FieldType.Number,
      };

      const medicalInsightsPPTemplateCommand: FieldCreateCommand = {
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
        type: FieldType.File,
      };

      const inMarketSalesDataCommand: FieldCreateCommand = {
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
        type: FieldType.File,
      };

      const priceCommand: FieldCreateCommand = {
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
        type: FieldType.Table,
      };

      const costCommand: FieldCreateCommand = {
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
        type: FieldType.Table,
      };

      const kpiDashboardButtonCommand: FieldCreateCommand = {
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
            microFrontendComponentId:
              kpisMicroFrontend.components[0]._id.toString(),
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
        type: FieldType.Button,
      };

      const pestelButtonCommand: FieldCreateCommand = {
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
            microFrontendComponentId:
              pestelMicroFrontend.components[0]._id.toString(),
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
        type: FieldType.Button,
      };

      const forecastButtonCommand: FieldCreateCommand = {
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
            microFrontendComponentId:
              forecastMicroFrontend.components[0]._id.toString(),
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
        type: FieldType.Button,
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
      const createCommand: ModelCreateCommand = {
        language: "en",
        modelEvents: [],
        name: "Case",
        modelFields: [],
        states: [
          {
            exclusive: false,
            language: "en",
            name: "Market Data",
            stateType: ModelStateType.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for inputs (Cost, Price, Medical Insights)",
            stateType: ModelStateType.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for forecast",
            stateType: ModelStateType.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Ready for business case",
            stateType: ModelStateType.ParentState,
          },
          {
            exclusive: true,
            language: "en",
            name: "Complete",
            stateType: ModelStateType.ParentState,
          },
        ],
        subStates: [
          {
            exclusive: false,
            language: "en",
            name: "Price",
            stateType: ModelStateType.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Cost",
            stateType: ModelStateType.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Medical Insights",
            stateType: ModelStateType.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "KPIs Completed",
            stateType: ModelStateType.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Pestel Completed",
            stateType: ModelStateType.SubState,
          },
          {
            exclusive: false,
            language: "en",
            name: "Product Forecast",
            stateType: ModelStateType.SubState,
          },
        ],
      };
      let model: IModel = await modelRepository.create(createCommand);

      const updateCommand: ModelUpdateCommand = {
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
      const priceRoleCreateCommand: RoleCreateCommand = {
        language: "en",
        name: "Pricing Team",
        permissions: [Permission.ReadUser, Permission.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [StaticPermission.Read, StaticPermission.Update],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermission.Read],
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
                trigger: EntityEventNotificationTrigger.OnAssigned,
              },
            ],
          },
        ],
      };
      const costRoleCreateCommand: RoleCreateCommand = {
        language: "en",
        name: "Controlling Team",
        permissions: [Permission.ReadUser, Permission.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [StaticPermission.Read, StaticPermission.Update],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermission.Read],
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
                trigger: EntityEventNotificationTrigger.OnAssigned,
              },
            ],
          },
        ],
      };
      const medicalInsightRoleCreateCommand: RoleCreateCommand = {
        language: "en",
        name: "Medical Insight Team",
        permissions: [Permission.ReadUser, Permission.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [StaticPermission.Read, StaticPermission.Update],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermission.Read],
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
                permissions: [StaticPermission.Read],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
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
                trigger: EntityEventNotificationTrigger.OnAssigned,
              },
            ],
          },
        ],
      };
      const marketingTeamCreateCommand: RoleCreateCommand = {
        language: "en",
        name: "Marketing Team",
        permissions: [Permission.ReadUser, Permission.ReadRole],
        entityPermissions: [
          {
            modelId: model._id.toString(),
            language: "en",
            permissions: [
              StaticPermission.Read,
              StaticPermission.Update,
              StaticPermission.Create,
              StaticPermission.Delete,
            ],
            entityUserAssignmentPermissionsByRole: {
              canAssignToUserFromSameRole: true,
              otherRolesIds: [],
            },
            entityFieldPermissions: [
              {
                fieldId: caseNameField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },
              {
                fieldId: productNameField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: countryField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: numberOfYearsOfForecastField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: costField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: priceField._id.toString(),
                permissions: [StaticPermission.Read],
              },

              {
                fieldId: inMarketSalesDataField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },
              {
                fieldId: medicalInsightPPTemplateField._id.toString(),
                permissions: [StaticPermission.Read],
              },
              {
                fieldId: kpiDashboardButtonField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: pestelButtonField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
              },

              {
                fieldId: forecastButtonField._id.toString(),
                permissions: [StaticPermission.Read, StaticPermission.Update],
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

      const headOfMarketingTeamCreateCommand: RoleCreateCommand = {
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
