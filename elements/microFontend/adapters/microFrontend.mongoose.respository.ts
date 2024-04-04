import mongoose from "mongoose";

import MicroFrontend from "./microFrontend.mongoose.model";
import microFrontendComponentMongooseRepository from "../../microFontendComponent/adapters/microFrontendComponent.respository";
import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendComponentUpdateCommand,
  IMicroFrontendCreateCommand,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";
import IMicroFrontend from "../ports/interfaces/IMicroFrontend";
import IMicroFrontendComponent from "../../microFontendComponent/ports/interfaces/IMicroFrontendComponent";
import { IField } from "../../field/ports/interfaces/IField";
import Field from "../../field/adapters/field.mongoose.model";
import IModel from "../../model/ports/interfaces/IModel";
import Model from "../../model/adapters/model.mongoose.model";

const microFrontendMongooseRepository = {
  createMicroFrontendComponents: async (
    commands: IMicroFrontendComponentCreateCommand[]
  ): Promise<IMicroFrontendComponent[]> => {
    const createComponentsPromises: Promise<IMicroFrontendComponent>[] = [];
    commands.forEach((command: IMicroFrontendComponentCreateCommand) => {
      createComponentsPromises.push(
        new Promise<IMicroFrontendComponent>(async (resolve) => {
          const microFrontendComponent: IMicroFrontendComponent =
            await microFrontendComponentMongooseRepository.create(command);

          resolve(microFrontendComponent);
        })
      );
    });

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await Promise.all(createComponentsPromises);

    return createdMicroFrontendsComponents;
  },
  updatMicroFrontendComponents: async (
    updateCommands: IMicroFrontendComponentUpdateCommand[]
  ): Promise<IMicroFrontendComponent[]> => {
    const createComponentsPromises: Promise<IMicroFrontendComponent>[] = [];
    updateCommands.forEach((command: IMicroFrontendComponentUpdateCommand) => {
      createComponentsPromises.push(
        new Promise<IMicroFrontendComponent>(async (resolve) => {
          const microFrontendComponent: IMicroFrontendComponent =
            await microFrontendComponentMongooseRepository.update(command);

          resolve(microFrontendComponent);
        })
      );
    });

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await Promise.all(createComponentsPromises);

    return createdMicroFrontendsComponents;
  },
  create: async (
    command: IMicroFrontendCreateCommand
  ): Promise<IMicroFrontend> => {
    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await microFrontendMongooseRepository.createMicroFrontendComponents(
        command.components
      );

    const microFrontend = (
      await MicroFrontend.create({
        name: command.name,
        components: createdMicroFrontendsComponents.map((el) => el._id),
        remoteEntry: command.remoteEntry,
      })
    ).toObject();

    return microFrontend;
  },
  update: async (
    command: IMicroFrontendUpdateCommand
  ): Promise<IMicroFrontend> => {
    const oldMicroFrontend: IMicroFrontend =
      await microFrontendMongooseRepository.getById(command._id);

    if (!oldMicroFrontend) {
      throw new Error("Micro-Frontend not found");
    }

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await microFrontendMongooseRepository.createMicroFrontendComponents(
        command.components.filter((el) => !Boolean(el._id))
      );

    await microFrontendMongooseRepository.updatMicroFrontendComponents(
      command.components
        .filter((el) => Boolean(el._id))
        .map((el) => {
          const command: IMicroFrontendComponentUpdateCommand = {
            _id: el._id || "",
            name: el.name,
          };

          return command;
        })
    );

    const componentsToDeleteIds: string[] = (
      oldMicroFrontend.components as IMicroFrontendComponent[]
    )
      .filter(
        (el) =>
          !command.components.find(
            (c) => c._id?.toString() === el._id.toString()
          )
      )
      .map((el) => el._id.toString());

    await microFrontendComponentMongooseRepository.delete(
      componentsToDeleteIds
    );

    await MicroFrontend.updateOne(
      { _id: command._id },
      {
        $set: {
          name: command.name,
          remoteEntry: command.remoteEntry,
          components: createdMicroFrontendsComponents
            .map((el) => el._id.toString())
            .concat(
              //@ts-ignore
              command.components
                .filter((el) => Boolean(el._id))
                .map((el) => el._id?.toString()) || []
            ),
        },
      }
    );

    const newMicroFrontend: IMicroFrontend =
      await microFrontendMongooseRepository.getById(command._id);

    return newMicroFrontend;
  },
  getById: async (id: string): Promise<IMicroFrontend> => {
    const microFrontend = await MicroFrontend.findById(id)
      ?.populate(populationOptions)
      .lean();

    if (!microFrontend) {
      throw new Error("MicroFrontend not found");
    }

    return microFrontend;
  },
  getMicroFrontends: async (
    command: IMicroFrontendsGetCommand
  ): Promise<{ total: number; microFrontends: IMicroFrontend[] }> => {
    const microFrontends: IMicroFrontend[] = await MicroFrontend.find({})
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .lean()
      .exec();

    const total: number = await MicroFrontend.find({}).count();

    return { microFrontends, total };
  },
  deleteMicroFrontends: async function (
    microFrontendsIds: string[]
  ): Promise<void> {
    for (let i = 0; i < microFrontendsIds.length; i++) {
      const microFrontend: IMicroFrontend | undefined = await this.getById(
        microFrontendsIds[i]
      );

      if (!microFrontend) {
        return;
      }

      // Deleting the events created on the basis of this microFrontend for fields
      const fields: IField[] = await Field.find({
        fieldEvents: {
          $elemMatch: {
            microFrontend: {
              _id: new mongoose.Types.ObjectId(microFrontend._id),
            },
          },
        },
      }).populate(populationOptions);

      for (let i = 0; i < fields.length; i++) {
        const field: IField = fields[i];
        const newFieldEvents = field.fieldEvents.filter(
          (event) =>
            (event.microFrontend as IMicroFrontend)?._id.toString() !==
            microFrontend._id.toString()
        );

        await Field.updateOne(
          { _id: field._id },
          { $set: { fieldEvents: newFieldEvents } }
        );
      }

      // Deleting the events created on the basis of this microFrontend for models
      const models: IModel[] = await Model.find({
        modelEvents: {
          $elemMatch: {
            microFrontend: {
              _id: new mongoose.Types.ObjectId(microFrontend._id),
            },
          },
        },
      })
        .populate(populationOptions)
        .lean();

      for (let i = 0; i < models.length; i++) {
        const model: IModel = models[i];
        const newModelEvents = model.modelEvents?.filter(
          (event) =>
            (event.microFrontend as IMicroFrontend)?._id.toString() !==
            microFrontend._id.toString()
        );
        Model.updateOne(
          { _id: model._id },
          { $set: { modelEvents: newModelEvents } }
        );

        await MicroFrontend.deleteOne({
          _id: new mongoose.Types.ObjectId(microFrontendsIds[i]),
        });
      }
    }

    return;
  },
  search: async (
    command: IMicroFrontendsSearchCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const query = MicroFrontend.find({
      name: { $regex: command.name },
    });

    const microFrontends: IMicroFrontend[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .lean();

    const total = await MicroFrontend.find({
      name: { $regex: command.name },
    }).count();

    return { microFrontends, total };
  },
  getByIds: async (ids: string[]): Promise<IMicroFrontend[]> => {
    const microFrontends: IMicroFrontend[] = await MicroFrontend.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .populate(populationOptions)
      .lean();

    return microFrontends;
  },
};

const populationOptions = {
  path: "components",
  model: "microFrontendComponent",
};

export default microFrontendMongooseRepository;
