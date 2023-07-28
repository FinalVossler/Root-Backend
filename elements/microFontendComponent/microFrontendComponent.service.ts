import mongoose from "mongoose";

import MicroFrontendUpdateCommand from "./dto/MicroFrontendComponentUpdateCommand";
import MicroFrontendComponentCreateCommand from "./dto/MicroFrontendComponentCreateCommand";
import { IMicroFrontendComponent } from "./microFrontendComponent.model";
import microFrontendComponentRepository from "./microFrontendComponent.respository";

const microFrontendComponentService = {
  create: async (
    command: MicroFrontendComponentCreateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.create(command);

    return microFrontendComponent;
  },
  update: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent =
      await microFrontendComponentRepository.update(command);

    return microFrontendComponent;
  },
  delete: async (
    microFrontendsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    await microFrontendComponentRepository.delete(microFrontendsIds);
  },
};

export default microFrontendComponentService;
