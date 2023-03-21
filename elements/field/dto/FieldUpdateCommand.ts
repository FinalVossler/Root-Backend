import { IField } from "../field.model";

type FieldUpdateCommand = {
  _id: string;
  name: string;
  type: IField["type"];
  language: string;
};

export default FieldUpdateCommand;
