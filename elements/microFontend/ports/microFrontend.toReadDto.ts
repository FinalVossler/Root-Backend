import {
  IMicroFrontendComponentReadDto,
  IMicroFrontendReadDto,
} from "roottypes";

import IMicroFrontend from "./interfaces/IMicroFrontend";
import IMicroFrontendComponent from "../../microFontendComponent/ports/interfaces/IMicroFrontendComponent";

export const microFrontendToReadDto = (
  microFrontend: IMicroFrontend | string
): IMicroFrontendReadDto | string => {
  if (
    typeof microFrontend === "string" ||
    Object.keys(microFrontend).length === 0
  ) {
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
    Object.keys(microFrontendComponent).length === 0
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
