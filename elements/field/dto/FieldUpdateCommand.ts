import EventCommand from "../../event/dto/EventCommand";
import { IField } from "../field.model";

type FieldUpdateCommand = {
  _id: string;
  name: string;
  type: IField["type"];
  fieldEvents: EventCommand[];
  language: string;
  options?: {
    label: string;
    value: string;
  }[];
};

export default FieldUpdateCommand;
