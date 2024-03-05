import { ITranslatedText } from "roottypes";
import { IModelField } from "../../adapters/model.mongoose.model";
import { IEvent } from "../../../event/event.model";
import { IModelState } from "../../../modelState/modelState.model";

export interface IModel {
  _id: string;
  name: ITranslatedText[];
  modelFields: IModelField[];
  modelEvents?: IEvent[];
  states?: IModelState[];
  subStates?: IModelState[];

  createdAt: string;
  updatedAt: string;
}

export default IModel;
