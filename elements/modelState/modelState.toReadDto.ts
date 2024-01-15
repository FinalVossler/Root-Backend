import { IModelStateReadDto } from "roottypes";
import { IModelState } from "./modelState.model";
import mongoose from "mongoose";

export const modelStateToReadDto = (
  modelState: IModelState | string
): IModelStateReadDto | string => {
  if (
    typeof modelState === "string" ||
    mongoose.Types.ObjectId.isValid(modelState.toString())
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
