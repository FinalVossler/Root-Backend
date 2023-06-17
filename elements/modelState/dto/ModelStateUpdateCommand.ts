import { ModelStateType } from "../modelState.model";

type ModelStateUpdateCommand = {
  _id?: string;
  name: string;
  stateType: ModelStateType;
  language: string;
};

export default ModelStateUpdateCommand;
