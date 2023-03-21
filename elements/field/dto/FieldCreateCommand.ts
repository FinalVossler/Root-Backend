import { IField } from "../field.model";

type FieldCreateCommand = {
  name: string;
  type: IField["type"];
  language: IField["type"];
};

export default FieldCreateCommand;
