import mongoose from "mongoose";

import MicroFrontend, { IMicroFrontend } from "./microFrontend.model";
import MicroFrontendCreateCommand from "./dto/MicroFrontendCreateCommand";
import MicroFrontendUpdateCommand from "./dto/MicroFrontendUpdateCommand";
import MicroFrontendsGetCommand from "./dto/MicroFrontendsGetCommand";
import MicroFrontendsSearchCommand from "./dto/MicroFrontendsSearchCommand";
import { IMicroFrontendComponent } from "../microFontendComponent/microFrontendComponent.model";
import microFrontendComponentRepository from "../microFontendComponent/microFrontendComponent.respository";
import MicroFrontendComponentUpdateCommand from "../microFontendComponent/dto/MicroFrontendComponentUpdateCommand";
import MicroFrontendComponentCreateCommand from "../microFontendComponent/dto/MicroFrontendComponentCreateCommand";

const microFrontendRepository = {
  createMicroFrontendComponents: async (
    commands: MicroFrontendComponentCreateCommand[]
  ): Promise<IMicroFrontendComponent[]> => {
    const createComponentsPromises: Promise<IMicroFrontendComponent>[] = [];
    commands.forEach((command: MicroFrontendComponentCreateCommand) => {
      createComponentsPromises.push(
        new Promise<IMicroFrontendComponent>(async (resolve) => {
          const microFrontendComponent: IMicroFrontendComponent =
            await microFrontendComponentRepository.create(command);

          resolve(microFrontendComponent);
        })
      );
    });

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await Promise.all(createComponentsPromises);

    return createdMicroFrontendsComponents;
  },
  updatMicroFrontendComponents: async (
    updateCommands: MicroFrontendComponentUpdateCommand[]
  ): Promise<IMicroFrontendComponent[]> => {
    const createComponentsPromises: Promise<IMicroFrontendComponent>[] = [];
    updateCommands.forEach((command: MicroFrontendComponentUpdateCommand) => {
      createComponentsPromises.push(
        new Promise<IMicroFrontendComponent>(async (resolve) => {
          const microFrontendComponent: IMicroFrontendComponent =
            await microFrontendComponentRepository.update(command);

          resolve(microFrontendComponent);
        })
      );
    });

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await Promise.all(createComponentsPromises);

    return createdMicroFrontendsComponents;
  },
  create: async (
    command: MicroFrontendCreateCommand
  ): Promise<IMicroFrontend> => {
    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await microFrontendRepository.createMicroFrontendComponents(
        command.components
      );

    const microFrontend = await MicroFrontend.create({
      name: command.name,
      components: createdMicroFrontendsComponents.map((el) => el._id),
      remoteEntry: command.remoteEntry,
    });

    return microFrontend;
  },
  update: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontend> => {
    const oldMicroFrontend: IMicroFrontend =
      await microFrontendRepository.getById(command._id);

    if (!oldMicroFrontend) {
      throw new Error("Micro-Frontend not found");
    }

    const createdMicroFrontendsComponents: IMicroFrontendComponent[] =
      await microFrontendRepository.createMicroFrontendComponents(
        command.components.filter((el) => !Boolean(el._id))
      );

    await microFrontendRepository.updatMicroFrontendComponents(
      command.components
        .filter((el) => Boolean(el._id))
        .map((el) => {
          const command: MicroFrontendComponentUpdateCommand = {
            _id: el._id || "",
            name: el.name,
          };

          return command;
        })
    );

    const componentsToDeleteIds: string[] = oldMicroFrontend.components
      .filter(
        (el) =>
          !command.components.find(
            (c) => c._id?.toString() === el._id.toString()
          )
      )
      .map((el) => el._id.toString());

    await microFrontendComponentRepository.delete(
      componentsToDeleteIds.map((el) => new mongoose.Types.ObjectId(el))
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
      await microFrontendRepository.getById(command._id);

    return newMicroFrontend;
  },
  getById: async (id: string): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend | null = await MicroFrontend.findById(
      id
    )?.populate(populationOptions);

    if (!microFrontend) {
      throw new Error("MicroFrontend not found");
    }

    return microFrontend;
  },
  getMicroFrontends: async (
    command: MicroFrontendsGetCommand
  ): Promise<{ total: number; microFrontends: IMicroFrontend[] }> => {
    const microFrontends: IMicroFrontend[] = await MicroFrontend.find({})
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await MicroFrontend.find({}).count();

    return { microFrontends, total };
  },
  deleteMicroFrontends: async (
    microFrontendsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    for (let i = 0; i < microFrontendsIds.length; i++) {
      await MicroFrontend.deleteOne({ _id: microFrontendsIds[i] });
    }

    return;
  },
  search: async (
    command: MicroFrontendsSearchCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const query = MicroFrontend.find({
      name: { $regex: command.name },
    });

    const microFrontends: IMicroFrontend[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await MicroFrontend.find({
      name: { $regex: command.name },
    }).count();

    return { microFrontends, total };
  },
  getByIds: async (ids: string[]): Promise<IMicroFrontend[]> => {
    const microFrontends: IMicroFrontend[] = await MicroFrontend.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    }).populate(populationOptions);

    return microFrontends;
  },
};

const populationOptions = {
  path: "components",
  model: "microFrontendComponent",
};

export default microFrontendRepository;
