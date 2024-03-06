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
    microFrontend.toString() !== "[object Object]"
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
    microFrontendComponent.toString() !== "[object Object]"
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
