import mongoose from "mongoose";

import MicroFrontend, { IMicroFrontend } from "./microFrontend.model";
import MicroFrontendCreateCommand from "./dto/MicroFrontendCreateCommand";
import MicroFrontendUpdateCommand from "./dto/MicroFrontendUpdateCommand";
import MicroFrontendsGetCommand from "./dto/MicroFrontendsGetCommand";
import MicroFrontendsSearchCommand from "./dto/MicroFrontendsSearchCommand";

const microFrontendRepository = {
  create: async (
    command: MicroFrontendCreateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend = await MicroFrontend.create({
      name: command.name,
      components: command.components,
      remoteEntry: command.remoteEntry,
    });

    return microFrontend;
  },
  update: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await MicroFrontend.findById(
      command._id
    );

    await MicroFrontend.updateOne(
      { _id: command._id },
      {
        $set: {
          name: command.name,
          remoteEntry: command.remoteEntry,
          components: command.components,
        },
      }
    );

    const newMicroFrontend: IMicroFrontend =
      await microFrontendRepository.getById(command._id);

    return newMicroFrontend;
  },
  getById: async (id: string): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await MicroFrontend.findById(id);
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
      .exec();

    const total: number = await MicroFrontend.find({}).count();

    return { microFrontends, total };
  },
  deleteMicroFrontends: async (
    microFrontendsIds: mongoose.ObjectId[]
  ): Promise<void> => {
    for (let i = 0; i < microFrontendsIds.length; i++) {
      await MicroFrontend.deleteOne({ _id: microFrontendsIds[i] });
    }

    return null;
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
      .limit(command.paginationCommand.limit);

    const total = await MicroFrontend.find({
      name: { $regex: command.name },
    }).count();

    return { microFrontends, total };
  },
  getByIds: async (ids: string[]): Promise<IMicroFrontend[]> => {
    const microFrontends: IMicroFrontend[] = await MicroFrontend.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    return microFrontends;
  },
};

export default microFrontendRepository;
