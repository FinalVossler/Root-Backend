import mongoose from "mongoose";

import Model, { IModel } from "./model.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
import ModelsSearchCommand from "./dto/ModelsSearchCommand";
import { IEventRequestHeader } from "../event/event.model";
import modelStateRepository from "../modelState/modelState.repository";
import { IModelState } from "../modelState/modelState.model";
import EventCommand from "../event/dto/EventCommand";

const modelRepository = {
  create: async (command: ModelCreateCommand): Promise<IModel> => {
    // create model states first:
    const modelStates: IModelState[] = await modelStateRepository.createMany(
      command.states
    );
    const modelSubstates: IModelState[] = await modelStateRepository.createMany(
      command.subStates
    );

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
      })),
      modelEvents: command.modelEvents.map<EventCommand>(
        (modelEvent: EventCommand) => ({
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
    });

    return model.populate(populationOptions);
  },
  update: async (command: ModelUpdateCommand): Promise<IModel> => {
    const model: IModel | null = await Model.findById(command._id).populate(
      populationOptions
    );

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

    await modelStateRepository.deleteMany(noLongerExistingModelStatesIds);

    // update model states first:
    const modelStates: IModelState[] = await modelStateRepository.updateMany(
      command.states
    );
    const modelSubstates: IModelState[] = await modelStateRepository.updateMany(
      command.subStates
    );

    await Model.updateOne(
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
          })),
          modelEvents: command.modelEvents.map<EventCommand>(
            (modelEvent: EventCommand) => ({
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
        },
      }
    );

    const newModel: IModel | null = await Model.findById(command._id).populate(
      populationOptions
    );

    if (!newModel) {
      throw new Error("Model not found");
    }

    return newModel;
  },
  getModels: async (
    command: ModelsGetCommand
  ): Promise<{ total: number; models: IModel[] }> => {
    const models: IModel[] = await Model.find({})
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Model.find({}).count();

    return { models, total };
  },
  getById: async (id: string): Promise<IModel> => {
    const model: IModel = (await Model.findById(id)
      .populate(populationOptions)
      .exec()) as IModel;

    return model;
  },
  getModelsByIds: async (
    command: ModelsGetCommand,
    ids: string[]
  ): Promise<{ total: number; models: IModel[] }> => {
    const models: IModel[] = await Model.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ createAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Model.find({}).count();

    return { models, total };
  },
  deleteModels: async (modelsIds: mongoose.Types.ObjectId[]): Promise<void> => {
    for (let i = 0; i < modelsIds.length; i++) {
      await Model.deleteOne({ _id: modelsIds[i] });
    }
  },
  search: async (
    command: ModelsSearchCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const query = Model.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    });

    const models: IModel[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Model.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { models, total };
  },
};

export const populationOptions = [
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
];

export default modelRepository;
