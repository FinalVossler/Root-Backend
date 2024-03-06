import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendUpdateCommand,
} from "roottypes";

import IMicroFrontendComponent from "./interfaces/IMicroFrontendComponent";
import IMicroFrontendComponentRepository from "./interfaces/IMicroFrontendComponentRepository";

const createMicroFrontendComponentService = (
  microFrontendComponentRepository: IMicroFrontendComponentRepository
) => ({
  create: async (
    command: IMicroFrontendComponentCreateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.create(command);

    return microFrontendComponent;
  },
  update: async (
    command: IMicroFrontendUpdateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.update(command);

    return microFrontendComponent;
  },
  delete: async (microFrontendsIds: string[]): Promise<void> => {
    await microFrontendComponentRepository.delete(microFrontendsIds);
  },
});

export default createMicroFrontendComponentService;
