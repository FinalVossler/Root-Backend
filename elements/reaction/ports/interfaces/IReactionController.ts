import { IReactionCreateCommand, IReactionReadDto } from "roottypes";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IRequest from "../../../../globalTypes/IRequest";
import IUser from "../../../user/ports/interfaces/IUser";

type IReactionController = {
  createReaction: (
    req: IRequest<IReactionCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IReactionReadDto>>;
};

export default IReactionController;
