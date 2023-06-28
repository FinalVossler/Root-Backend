import EventCommand from "../../event/dto/EventCommand";
import FieldTableElementUpdateCommand from "../../fieldTableElement/dto/FieldTableElementUpdateCommand";
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
  tableOptions: {
    name: string;
    columns: FieldTableElementUpdateCommand[];
    rows: FieldTableElementUpdateCommand[];
    yearTable: boolean;
  };
};

export default FieldUpdateCommand;
