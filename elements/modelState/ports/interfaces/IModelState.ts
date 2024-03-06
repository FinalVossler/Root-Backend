import { ITranslatedText, ModelStateTypeEnum } from "roottypes";

export default interface IModelState {
  _id: string;
  name: ITranslatedText[];
  stateType: ModelStateTypeEnum;
  // Means that it will block entities from showing in other states
  exlusive?: boolean;
}
