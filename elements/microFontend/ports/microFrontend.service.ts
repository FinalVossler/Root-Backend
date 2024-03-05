import microFrontendRepository from "../adapters/microFrontend.mongoose.respository";
import {
  IMicroFrontendCreateCommand,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
  PermissionEnum,
} from "roottypes";
import IMicroFrontend from "./interfaces/IMicroFrontend";
import IMicroFrontendService from "./interfaces/IMicroFrontendService";
import IUser from "../../user/ports/interfaces/IUser";
import IRoleService from "../../role/ports/interfaces/IRoleService";

const createMicroFrontendService = (
  roleService: IRoleService
): IMicroFrontendService => ({
  createMicroFrontend: async (
    command: IMicroFrontendCreateCommand,
    currentUser: IUser
  ): Promise<IMicroFrontend> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateMicroFrontend,
    });

    const microFrontend: IMicroFrontend = await microFrontendRepository.create(
      command
    );

    return microFrontend;
  },
  updateMicroFrontend: async (
    command: IMicroFrontendUpdateCommand,
    currentUser: IUser
  ): Promise<IMicroFrontend> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdateMicroFrontend,
    });

    const microFrontend: IMicroFrontend = await microFrontendRepository.update(
      command
    );

    return microFrontend;
  },
  getMicroFrontends: async (
    command: IMicroFrontendsGetCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const { microFrontends, total } =
      await microFrontendRepository.getMicroFrontends(command);

    return { microFrontends, total };
  },
  getById: async (id: string): Promise<IMicroFrontend> => {
    const microFrontend: IMicroFrontend = await microFrontendRepository.getById(
      id
    );

    return microFrontend;
  },
  deleteMicroFrontends: async (
    microFrontendsIds: string[],
    currentUser: IUser
  ): Promise<void> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteMicroFrontend,
    });
    await microFrontendRepository.deleteMicroFrontends(microFrontendsIds);
  },
  search: async (
    command: IMicroFrontendsSearchCommand
  ): Promise<{ microFrontends: IMicroFrontend[]; total: number }> => {
    const { microFrontends, total } = await microFrontendRepository.search(
      command
    );

    return { microFrontends, total };
  },
});

export default createMicroFrontendService;
