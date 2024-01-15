import {
  IMicroFrontendComponentReadDto,
  IMicroFrontendReadDto,
} from "roottypes";
import { IMicroFrontend } from "./microFrontend.model";
import { IMicroFrontendComponent } from "../microFontendComponent/microFrontendComponent.model";
import mongoose from "mongoose";

export const microFrontendToReadDto = (
  microFrontend: IMicroFrontend
): IMicroFrontendReadDto => {
  return {
    _id: microFrontend._id.toString(),
    name: microFrontend.name,
    remoteEntry: microFrontend.remoteEntry,
    components: microFrontend.components.map((c) =>
      microFrontendComponentToReadDto(c)
    ),
    createdAt: microFrontend.createdAt,
    updatedAt: microFrontend.updatedAt,
  };
};

export const microFrontendComponentToReadDto = (
  microFrontendComponent: IMicroFrontendComponent | string
): IMicroFrontendComponentReadDto | string => {
  if (
    typeof microFrontendComponent === "string" ||
    mongoose.Types.ObjectId.isValid(microFrontendComponent.toString())
  ) {
    return microFrontendComponent.toString();
  }

  return {
    _id: microFrontendComponent._id.toString(),
    name: microFrontendComponent.name,
    createdAt: microFrontendComponent.createdAt,
    updatedAt: microFrontendComponent.updatedAt,
  };
};
