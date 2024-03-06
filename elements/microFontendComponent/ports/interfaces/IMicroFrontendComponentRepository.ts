import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendComponentUpdateCommand,
} from "roottypes";

import IMicroFrontendComponent from "./IMicroFrontendComponent";

interface IMicroFrontendComponentRepository {
  create: (
    command: IMicroFrontendComponentCreateCommand
  ) => Promise<IMicroFrontendComponent>;
  update: (
    command: IMicroFrontendComponentUpdateCommand
  ) => Promise<IMicroFrontendComponent>;
  getById: (id: string) => Promise<IMicroFrontendComponent>;
  delete: (microFrontendsComponentsIds: string[]) => Promise<void>;
  getByIds: (ids: string[]) => Promise<IMicroFrontendComponent[]>;
}

export default IMicroFrontendComponentRepository;
