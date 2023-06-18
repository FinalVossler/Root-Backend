import { IModelState } from "../modelState.model";

type ModelStateReadDto = {
  _id: IModelState["_id"];
  name: IModelState["name"];
  stateType: IModelState["stateType"];
  exlusive?: IModelState["exlusive"];
};

export const toReadDto = (modelState: IModelState): ModelStateReadDto => {
  return {
    _id: modelState._id,
    name: modelState.name,
    stateType: modelState.stateType,
    exlusive: modelState.exlusive,
  };
};

export default ModelStateReadDto;
