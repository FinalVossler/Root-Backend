import mongoose from "mongoose";
import {
  IEventCommand,
  IModelCreateCommand,
  IModelSection,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";

import Model from "./model.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import modelStateMongooseRepository from "../../modelState/adapters/modelState.mongoose.repository";
import IModel, { IModelField } from "../ports/interfaces/IModel";
import IModelRepository from "../ports/interfaces/IModelRepository";
import { IEventRequestHeader } from "../../event/ports/interfaces/IEvent";
import IModelState from "../../modelState/ports/interfaces/IModelState";
import _ from "lodash";

const modelMongooseRepository: IModelRepository = {
  create: async (
    command: IModelCreateCommand,
    ownerId?: string
  ): Promise<IModel> => {
    // create model states first:
    const modelStates: IModelState[] =
      await modelStateMongooseRepository.createMany(command.states);
    const modelSubstates: IModelState[] =
      await modelStateMongooseRepository.createMany(command.subStates);

    const model = await Model.create({
      name: [{ language: command.language, text: command.name }],
      modelFields: command.modelFields.map((modelField) => ({
        field: modelField.fieldId,
        required: modelField.required,
        conditions:
          modelField.conditions?.map((condition) => ({
            value: condition.value,
            conditionType: condition.conditionType,
            field: condition.fieldId || undefined,
            modelState: condition.modelStateId,
          })) || [],
        states: modelField.modelStatesIds,
        mainField: modelField.mainField,
        stickInTable: modelField.stickInTable,
        isVariation: modelField.isVariation,
      })),
      modelEvents: command.modelEvents.map<IEventCommand>(
        (modelEvent: IEventCommand) => ({
          eventTrigger: modelEvent.eventTrigger,
          eventType: modelEvent.eventType,
          redirectionToSelf: modelEvent.redirectionToSelf,
          redirectionUrl: modelEvent.redirectionUrl,
          requestData: modelEvent.requestData,
          requestDataIsCreatedEntity: modelEvent.requestDataIsCreatedEntity,
          requestMethod: modelEvent.requestMethod,
          requestUrl: modelEvent.requestUrl,
          requestHeaders: modelEvent.requestHeaders.map<IEventRequestHeader>(
            (header: IEventRequestHeader) => ({
              key: header.key,
              value: header.value,
            })
          ),

          microFrontend: modelEvent.microFrontendId,
          microFrontendComponentId: modelEvent.microFrontendComponentId,
        })
      ),
      states: modelStates.map((el) => el._id),
      subStates: modelSubstates.map((el) => el._id),

      showInSideMenu: Boolean(command.showInSideMenu),
      isForSale: Boolean(command.isForSale),
      quantityField: command.quantityFieldId,
      priceField: command.priceFieldId,
      imageField: command.imageFieldId,

      isForOrders: command.isForOrders,
      orderAssociationConfig: command.orderAssociationConfig,
      viewType: command.viewType,
      sections: command.sections.map((el) => {
        const section: IModelSection = {
          direction: el.direction,
          uuid: el.uuid,
          customData: el.customData,
          children: el.children,
        };

        return section;
      }),

      owner: new mongoose.Types.ObjectId(ownerId),
    });

    return (await model.populate(modelPopulationOptions)).toObject();
  },
  update: async (command: IModelUpdateCommand): Promise<IModel> => {
    const model: IModel | null = (await Model.findById(command._id).populate(
      modelPopulationOptions
    )) as IModel;

    if (!model) throw new Error("Model doesn't exist");

    // Delete no longer existing model states:
    const noLongerExistingModelStatesIds =
      model.states
        ?.filter((modelState: IModelState) => {
          return !Boolean(
            command.states.find((el) => el._id === modelState._id.toString())
          );
        })
        .map((el) => el._id) || [];

    await modelStateMongooseRepository.deleteMany(
      noLongerExistingModelStatesIds
    );

    // update model states first:
    const modelStates: IModelState[] =
      await modelStateMongooseRepository.updateMany(command.states);
    const modelSubstates: IModelState[] =
      await modelStateMongooseRepository.updateMany(command.subStates);

    const newModel = await Model.findOneAndUpdate(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: model.name,
          }),
          modelFields: command.modelFields.map((modelField) => ({
            field: modelField.fieldId,
            required: modelField.required,
            conditions:
              modelField.conditions?.map((condition) => {
                return {
                  value: condition.value,
                  conditionType: condition.conditionType,
                  field: condition.fieldId || undefined,
                  modelState: condition.modelStateId,
                };
              }) || [],
            states: modelField.modelStatesIds,
            mainField: modelField.mainField,
            stickInTable: modelField.stickInTable,
            isVariation: modelField.isVariation,
          })),
          modelEvents: command.modelEvents.map<IEventCommand>(
            (modelEvent: IEventCommand) => ({
              eventTrigger: modelEvent.eventTrigger,
              eventType: modelEvent.eventType,
              redirectionToSelf: modelEvent.redirectionToSelf,
              redirectionUrl: modelEvent.redirectionUrl,
              requestData: modelEvent.requestData,
              requestDataIsCreatedEntity: modelEvent.requestDataIsCreatedEntity,
              requestMethod: modelEvent.requestMethod,
              requestUrl: modelEvent.requestUrl,
              requestHeaders:
                modelEvent.requestHeaders.map<IEventRequestHeader>(
                  (header: IEventRequestHeader) => ({
                    key: header.key,
                    value: header.value,
                  })
                ),
              microFrontend: modelEvent.microFrontendId,
              microFrontendComponentId: modelEvent.microFrontendComponentId,
            })
          ),
          states: modelStates.map((el) => el._id),
          subStates: modelSubstates.map((el) => el._id),

          isForSale: Boolean(command.isForSale),
          quantityField: command.quantityFieldId,
          priceField: command.priceFieldId,
          imageField: command.imageFieldId,

          isForOrders: command.isForOrders,
          showInSideMenu: command.showInSideMenu,
          orderAssociationConfig: command.orderAssociationConfig,
          viewType: command.viewType,
          sections: command.sections.map((el) => {
            const section: IModelSection = {
              direction: el.direction,
              uuid: el.uuid,
              customData: el.customData,
              children: el.children,
            };

            return section;
          }),
        },
      },
      { new: true }
    )
      .populate(modelPopulationOptions)
      .lean();

    if (!newModel) {
      throw new Error("Model not found");
    }

    return newModel;
  },
  getModels: async (
    command: IModelsGetCommand,
    ownerId?: string
  ): Promise<{ total: number; models: IModel[] }> => {
    const conditionsQuery = {
      ...(ownerId ? { owner: new mongoose.Types.ObjectId(ownerId) } : {}),
    };

    const models: IModel[] = await Model.find(conditionsQuery)
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(modelPopulationOptions)
      .lean()
      .exec();

    const total: number = await Model.find(conditionsQuery).count();

    return { models, total };
  },
  getById: async (id: string) => {
    const model = await Model.findById(id)
      .populate(modelPopulationOptions)
      .lean()
      .exec();

    return model;
  },
  getModelsContainingField: async (fieldId: string): Promise<IModel[]> => {
    const models: IModel[] = await Model.find({
      modelFields: { $elemMatch: { field: { _id: fieldId } } },
    })
      .populate(modelPopulationOptions)
      .lean();

    return models;
  },
  deleteModels: async (modelsIds: string[]): Promise<void> => {
    for (let i = 0; i < modelsIds.length; i++) {
      await Model.deleteOne({ _id: new mongoose.Types.ObjectId(modelsIds[i]) });
    }
  },
  deleteModel: async (modelId: string): Promise<void> => {
    await Model.deleteOne({ _id: new mongoose.Types.ObjectId(modelId) });
  },
  search: async (
    command: IModelsSearchCommand,
    ownerId?: string
  ): Promise<{ models: IModel[]; total: number }> => {
    const conditionsQuery = {
      name: { $elemMatch: { text: { $regex: command.name } } },
      ...(ownerId ? { owner: new mongoose.Types.ObjectId(ownerId) } : {}),
    };
    const query = Model.find(conditionsQuery);

    const models: IModel[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(modelPopulationOptions)
      .lean();

    const total = await Model.find(conditionsQuery).count();

    return { models, total };
  },
  getModelsByIds: async (
    command: IModelsGetCommand,
    ids: string[]
  ): Promise<{ total: number; models: IModel[] }> => {
    const queryConditions = {
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    };

    const models: IModel[] = await Model.find(queryConditions)
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(modelPopulationOptions)
      .lean()
      .exec();

    const total: number = await Model.find(queryConditions).count();

    return { models, total };
  },
  getAllModelsByIds: async (ids: string[]) => {
    const queryConditions = {
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    };

    const models: IModel[] = await Model.find(queryConditions)
      .sort({ createAt: -1 })
      .populate(modelPopulationOptions)
      .lean()
      .exec();

    return models;
  },
  updateModelFields: async (params: {
    modelId: string;
    newModelFields: IModelField[];
  }) => {
    await Model.updateOne(
      { _id: new mongoose.Types.ObjectId(params.modelId) },
      { $set: { modelFields: params.newModelFields } }
    );
  },
  getUnpopulatedByIds: async (ids: string[]) => {
    return await Model.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();
  },
  copyModels: async function (ids: string[], ownerId: string) {
    const modelsToCopy = await (this as IModelRepository).getUnpopulatedByIds(
      ids
    );

    const copyPromises: Promise<IModel>[] = [];

    modelsToCopy.forEach((model) => {
      const promise = new Promise<IModel>(async (resolve, reject) => {
        const newModelObject = _.cloneDeep(model);
        // @ts-ignore
        delete newModelObject._id;
        newModelObject.owner = ownerId;

        const copiedModel = (
          await (
            await Model.create(newModelObject)
          ).populate(modelPopulationOptions)
        ).toObject();

        resolve(copiedModel);
      });

      copyPromises.push(promise);
    });

    const copiedModels = await Promise.all(copyPromises);

    return copiedModels;
  },
};

export const modelPopulationOptions = [
  {
    path: "modelFields",
    populate: [
      {
        path: "field",
        model: "field",
        populate: [
          {
            path: "options",
          },
          {
            path: "tableOptions",
            populate: [
              {
                path: "columns",
                model: "fieldTableElement",
              },
              {
                path: "rows",
                model: "fieldTableElement",
              },
            ],
          },
          {
            path: "fieldEvents",
            populate: [
              {
                path: "microFrontend",
                model: "microFrontend",
                populate: [
                  {
                    path: "components",
                    model: "microFrontendComponent",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "conditions",
        populate: [
          {
            path: "field",
            model: "field",
          },
          {
            path: "modelState",
            model: "modelState",
          },
        ],
      },
      {
        path: "states",
        model: "modelState",
      },
    ],
  },
  {
    path: "modelEvents",
    populate: [
      {
        path: "microFrontend",
        model: "microFrontend",
        populate: [
          {
            path: "components",
            model: "microFrontendComponent",
          },
        ],
      },
    ],
  },
  {
    path: "states",
  },
  {
    path: "subStates",
  },
  {
    path: "quantityField",
    model: "field",
  },
  {
    path: "priceField",
    model: "field",
  },
  {
    path: "imageField",
    model: "field",
  },
  {
    path: "owner",
    model: "user",
  },
];

export default modelMongooseRepository;
