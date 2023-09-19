import mongoose from "mongoose";

import MicroFrontendComponent, {
  IMicroFrontendComponent,
} from "./microFrontendComponent.model";
import MicroFrontendComponentCreateCommand from "./dto/MicroFrontendComponentCreateCommand";
import MicroFrontendUpdateCommand from "./dto/MicroFrontendComponentUpdateCommand";

const microFrontendComponentRepository = {
  create: async (
    command: MicroFrontendComponentCreateCommand
  ): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent = await MicroFrontendComponent.create({
      name: command.name,
    });

    return microFrontendComponent;
  },
  update: async (
    command: MicroFrontendUpdateCommand
  ): Promise<IMicroFrontendComponent> => {
    await MicroFrontendComponent.updateOne(
      { _id: command._id },
      {
        $set: {
          name: command.name,
        },
      }
    );

    const newMicroFrontend: IMicroFrontendComponent =
      await microFrontendComponentRepository.getById(command._id);

    return newMicroFrontend;
  },
  getById: async (id: string): Promise<IMicroFrontendComponent> => {
    const microFrontendComponent: IMicroFrontendComponent | null =
      await MicroFrontendComponent.findById(id);

    if (!microFrontendComponent) {
      throw new Error("MicroFrontend not found");
    }
    return microFrontendComponent;
  },
  delete: async (
    microFrontendsComponentsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    for (let i = 0; i < microFrontendsComponentsIds.length; i++) {
      await MicroFrontendComponent.deleteOne({
        _id: microFrontendsComponentsIds[i],
      });
    }

    return;
  },
  getByIds: async (ids: string[]): Promise<IMicroFrontendComponent[]> => {
    const microFrontends: IMicroFrontendComponent[] =
      await MicroFrontendComponent.find({
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      });

    return microFrontends;
  },
};

export default microFrontendComponentRepository;
