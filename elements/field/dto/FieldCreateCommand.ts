import { IField } from "../field.model";

type FieldCreateCommand = {
  name: string;
  type: IField["type"];
  language: string;
};

export default FieldCreateCommand;
