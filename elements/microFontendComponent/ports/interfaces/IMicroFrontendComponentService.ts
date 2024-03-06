import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendUpdateCommand,
} from "roottypes";

import IMicroFrontendComponent from "./IMicroFrontendComponent";

export default interface IMicroFrontendComponentService {
  create: (
    command: IMicroFrontendComponentCreateCommand
  ) => Promise<IMicroFrontendComponent>;
  update: (
    command: IMicroFrontendUpdateCommand
  ) => Promise<IMicroFrontendComponent>;
  delete: (microFrontendsIds: string[]) => Promise<void>;
}
