import mongoose from "mongoose";

import MicroFrontendUpdateCommand from "./dto/MicroFrontendComponentUpdateCommand";
import MicroFrontendComponentCreateCommand from "./dto/MicroFrontendComponentCreateCommand";
import { IMicroFrontendComponent } from "./microFrontendComponent.model";
import microFrontendComponentRepository from "./microFrontendComponent.respository";

const microFrontendComponentService = {
  createMicroFrontendComponent: async (
    command: MicroFrontendComponentCreateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.create(command);

    return microFrontendComponent;
  },
  updateMicroFrontend: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.update(command);

    return microFrontendComponent;
  },
  deleteMicroFrontends: async (
    microFrontendsIds: mongoose.ObjectId[]
  ): Promise<void> => {
    await microFrontendComponentRepository.deleteMicroFrontends(
      microFrontendsIds
    );
  },
};

export default microFrontendComponentService;
