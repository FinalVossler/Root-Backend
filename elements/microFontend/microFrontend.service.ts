import mongoose from "mongoose";

import MicroFrontendCreateCommand from "./dto/MicroFrontendCreateCommand";
import { IMicroFrontend } from "./microFrontend.model";
import microFrontendRepository from "./microFrontend.respository";
import MicroFrontendUpdateCommand from "./dto/MicroFrontendUpdateCommand";
import MicroFrontendsGetCommand from "./dto/MicroFrontendsGetCommand";
import MicroFrontendsSearchCommand from "./dto/MicroFrontendsSearchCommand";

const microFrontendService = {
  createMicroFrontend: async (
    command: MicroFrontendCreateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.create(
      command
    );

    return microFrontend;
  },
  updateMicroFrontend: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.update(
      command
    );

    return microFrontend;
  },
  getMicroFrontends: async (
    command: MicroFrontendsGetCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const { microFrontends, total } =
      await microFrontendRepository.getMicroFrontends(command);

    return { microFrontends, total };
  },
  getById: async (id: string): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.getById(
      id
    );

    return microFrontend;
  },
  deleteMicroFrontends: async (
    microFrontendsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    await microFrontendRepository.deleteMicroFrontends(microFrontendsIds);
  },
  search: async (
    command: MicroFrontendsSearchCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const { microFrontends, total } = await microFrontendRepository.search(
      command
    );

    return { microFrontends, total };
  },
};

export default microFrontendService;
