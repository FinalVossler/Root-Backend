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
    console.log("command", command);
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
    const microFrontendComponent: IMicroFrontendComponent =
      await MicroFrontendComponent.findById(id);
    return microFrontendComponent;
  },
  deleteMicroFrontendComponents: async (
    microFrontendsComponentsIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    for (let i = 0; i < microFrontendsComponentsIds.length; i++) {
      await MicroFrontendComponent.deleteOne({
        _id: microFrontendsComponentsIds[i],
      });
    }

    return null;
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
