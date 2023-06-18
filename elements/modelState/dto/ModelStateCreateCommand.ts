import { ModelStateType } from "../modelState.model";

type ModelStateCreateCommand = {
  name: string;
  stateType: ModelStateType;
  exclusive: boolean;
  language: string;
};

export default ModelStateCreateCommand;
