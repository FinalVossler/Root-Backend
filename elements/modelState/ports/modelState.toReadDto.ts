import { IModelStateReadDto } from "roottypes";

import IModelState from "./interfaces/IModelState";

export const modelStateToReadDto = (
  modelState: IModelState | string
): IModelStateReadDto | string => {
  if (
    typeof modelState === "string" ||
    modelState.toString() !== "[object Object]"
  ) {
    return modelState.toString();
  }
  return {
    _id: modelState._id.toString(),
    name: modelState.name,
    stateType: modelState.stateType,
    exlusive: modelState.exlusive,
  };
};
