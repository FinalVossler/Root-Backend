import { IMicroFrontendComponent } from "../../microFontendComponent/microFrontendComponent.model";
import { IMicroFrontend } from "../microFrontend.model";

type MicroFrontendReadDto = {
  _id: IMicroFrontend["_id"];
  name: string;
  remoteEntry: string;
  components: IMicroFrontendComponent[];

  createdAt: string;
  updatedAt: string;
};

export const toReadDto = (model: IMicroFrontend): MicroFrontendReadDto => {
  return {
    _id: model._id,
    name: model.name,
    remoteEntry: model.remoteEntry,
    components: model.components,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
};

export default MicroFrontendReadDto;
