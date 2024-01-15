import mongoose from "mongoose";

import { IMicroFrontendComponent } from "./microFrontendComponent.model";
import microFrontendComponentRepository from "./microFrontendComponent.respository";
import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendUpdateCommand,
} from "roottypes";

const microFrontendComponentService = {
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
  delete: async (
    microFrontendsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    await microFrontendComponentRepository.delete(microFrontendsIds);
  },
};

export default microFrontendComponentService;
