import { IModel } from "../model.model";

type ModelUpdateCommand = {
  _id: string;
  name: string;
  modelFields: IModel["modelFields"];
  language: string;
};

export default ModelUpdateCommand;
