import { ModelStateType } from "../modelState.model";

type ModelStateCreateCommand = {
  name: string;
  stateType: ModelStateType;
  language: string;
};

export default ModelStateCreateCommand;
