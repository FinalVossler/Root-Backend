import mongoose from "mongoose";

import MicroFrontendComponent from "./microFrontendComponent.mongoose.model";
import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendComponentUpdateCommand,
} from "roottypes";
import IMicroFrontendComponent from "../ports/interfaces/IMicroFrontendComponent";
import IMicroFrontendComponentRepository from "../ports/interfaces/IMicroFrontendComponentRepository";

const microFrontendComponentMongooseRepository: IMicroFrontendComponentRepository =
  {
    create: async (
      command: IMicroFrontendComponentCreateCommand
    ): Promise<IMicroFrontendComponent> => {
      const microFrontendComponent = await MicroFrontendComponent.create({
        name: command.name,
      });

      return microFrontendComponent;
    },
    update: async function (
      command: IMicroFrontendComponentUpdateCommand
    ): Promise<IMicroFrontendComponent> {
      await MicroFrontendComponent.updateOne(
        { _id: command._id },
        {
          $set: {
            name: command.name,
          },
        }
      );

      const newMicroFrontend: IMicroFrontendComponent = await this.getById(
        command._id
      );

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
    delete: async (microFrontendsComponentsIds: string[]): Promise<void> => {
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

export default microFrontendComponentMongooseRepository;
