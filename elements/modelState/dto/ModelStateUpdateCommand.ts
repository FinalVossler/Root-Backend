import { ModelStateType } from "../modelState.model";

type ModelStateUpdateCommand = {
  _id?: string;
  name: string;
  stateType: ModelStateType;
  exclusive: boolean;
  language: string;
};

export default ModelStateUpdateCommand;
