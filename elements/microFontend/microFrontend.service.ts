import { IMicroFrontend } from "./microFrontend.model";
import microFrontendRepository from "./microFrontend.respository";
import {
  IMicroFrontendCreateCommand,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";

const microFrontendService = {
  createMicroFrontend: async (
    command: IMicroFrontendCreateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.create(
      command
    );

    return microFrontend;
  },
  updateMicroFrontend: async (
    command: IMicroFrontendUpdateCommand
  ): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.update(
      command
    );

    return microFrontend;
  },
  getMicroFrontends: async (
    command: IMicroFrontendsGetCommand
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
  deleteMicroFrontends: async (microFrontendsIds: string[]): Promise<void> => {
    await microFrontendRepository.deleteMicroFrontends(microFrontendsIds);
  },
  search: async (
    command: IMicroFrontendsSearchCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const { microFrontends, total } = await microFrontendRepository.search(
      command
    );

    return { microFrontends, total };
  },
};

export default microFrontendService;
