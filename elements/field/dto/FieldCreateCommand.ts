import { IField } from "../field.model";

type FieldCreateCommand = {
  name: string;
  type: IField["type"];
  language: string;
  options?: {
    label: string;
    value: string;
  }[];
};

export default FieldCreateCommand;
