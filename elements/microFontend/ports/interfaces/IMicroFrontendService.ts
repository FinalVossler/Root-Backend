import IUser from "../../../user/ports/interfaces/IUser";
import {
  IMicroFrontendCreateCommand,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";
import IMicroFrontend from "./IMicroFrontend";

interface IMicroFrontendService {
  createMicroFrontend: (
    command: IMicroFrontendCreateCommand,
    currentUser: IUser
  ) => Promise<IMicroFrontend>;
  updateMicroFrontend: (
    command: IMicroFrontendUpdateCommand,
    currentUser: IUser
  ) => Promise<IMicroFrontend>;
  getMicroFrontends: (
    command: IMicroFrontendsGetCommand,
    currentUser: IUser
  ) => Promise<{ microFrontends: IMicroFrontend[]; total: number }>;
  getById: (id: string, currentUser: IUser) => Promise<IMicroFrontend>;
  deleteMicroFrontends: (
    microFrontendsIds: string[],
    currentUser: IUser
  ) => Promise<void>;
  search: (
    command: IMicroFrontendsSearchCommand
  ) => Promise<{ microFrontends: IMicroFrontend[]; total: number }>;
}

export default IMicroFrontendService;
