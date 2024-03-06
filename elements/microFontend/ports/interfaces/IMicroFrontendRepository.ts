import {
  IMicroFrontendComponentCreateCommand,
  IMicroFrontendComponentUpdateCommand,
  IMicroFrontendCreateCommand,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";

import IMicroFrontend from "./IMicroFrontend";
import IMicroFrontendComponent from "../../../microFontendComponent/ports/interfaces/IMicroFrontendComponent";

interface IMicroFrontendRepository {
  createMicroFrontendComponents: (
    commands: IMicroFrontendComponentCreateCommand[]
  ) => Promise<IMicroFrontendComponent[]>;
  updatMicroFrontendComponents: (
    updateCommands: IMicroFrontendComponentUpdateCommand[]
  ) => Promise<IMicroFrontendComponent[]>;
  create: (command: IMicroFrontendCreateCommand) => Promise<IMicroFrontend>;
  update: (command: IMicroFrontendUpdateCommand) => Promise<IMicroFrontend>;
  getById: (id: string) => Promise<IMicroFrontend>;
  getMicroFrontends: (
    command: IMicroFrontendsGetCommand
  ) => Promise<{ total: number; microFrontends: IMicroFrontend[] }>;
  deleteMicroFrontends: (microFrontendsIds: string[]) => Promise<void>;
  search: (
    command: IMicroFrontendsSearchCommand
  ) => Promise<{ microFrontends: IMicroFrontend[]; total: number }>;
  getByIds: (ids: string[]) => Promise<IMicroFrontend[]>;
}

export default IMicroFrontendRepository;
