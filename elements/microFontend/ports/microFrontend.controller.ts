import {
  IMicroFrontendCreateCommand,
  IMicroFrontendReadDto,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";

import { microFrontendToReadDto } from "./microFrontend.toReadDto";
import IMicroFrontend from "./interfaces/IMicroFrontend";
import IRequest from "../../../globalTypes/IRequest";
import IMicroFrontendController from "./interfaces/IMicroFrontendController";
import IMicroFrontendService from "./interfaces/IMicroFrontendService";
import IUser from "../../user/ports/interfaces/IUser";

const createMicroFrontendController = (
  microFrontendService: IMicroFrontendService
): IMicroFrontendController => ({
  createMicroFrontend: async (
    req: IRequest<IMicroFrontendCreateCommand>,
    currentUser: IUser
  ) => {
    const microFrontend: IMicroFrontend =
      await microFrontendService.createMicroFrontend(req.body, currentUser);

    return {
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    };
  },
  updateMicroFrontend: async (
    req: IRequest<IMicroFrontendUpdateCommand>,
    currentUser: IUser
  ) => {
    const microFrontend: IMicroFrontend =
      await microFrontendService.updateMicroFrontend(req.body, currentUser);

    return {
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    };
  },
  getMicroFrontends: async (
    req: IRequest<IMicroFrontendsGetCommand>,
    currentUser: IUser
  ) => {
    const { microFrontends, total } =
      await microFrontendService.getMicroFrontends(req.body, currentUser);

    return {
      success: true,
      data: {
        data: microFrontends.map(
          (p) => microFrontendToReadDto(p) as IMicroFrontendReadDto
        ),
        total,
      },
    };
  },
  getById: async (
    req: IRequest<any, any, { microFrontendId: string }>,
    currentUser: IUser
  ) => {
    const id: string = req.query.microFrontendId;
    const microFrontend: IMicroFrontend = await microFrontendService.getById(
      id,
      currentUser
    );

    return {
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    };
  },
  deleteMicroFrontends: async (req: IRequest<string[]>, currentUser: IUser) => {
    await microFrontendService.deleteMicroFrontends(req.body, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  searchMicroFrontends: async (req: IRequest<IMicroFrontendsSearchCommand>) => {
    const command: IMicroFrontendsSearchCommand = req.body;

    const { microFrontends, total } = await microFrontendService.search(
      command
    );

    return {
      success: true,
      data: {
        data: microFrontends.map(
          (p) => microFrontendToReadDto(p) as IMicroFrontendReadDto
        ),
        total,
      },
    };
  },
});

export default createMicroFrontendController;
