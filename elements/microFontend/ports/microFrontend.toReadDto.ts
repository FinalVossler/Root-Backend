import {
  IMicroFrontendComponentReadDto,
  IMicroFrontendReadDto,
} from "roottypes";
import { IMicroFrontendComponent } from "../../microFontendComponent/microFrontendComponent.model";
import IMicroFrontend from "./interfaces/IMicroFrontend";

export const microFrontendToReadDto = (
  microFrontend: IMicroFrontend | string
): IMicroFrontendReadDto | string => {
  if (typeof microFrontend === "string" || !microFrontend["_id"]) {
    return microFrontend.toString();
  }

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
    !microFrontendComponent["_id"]
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
