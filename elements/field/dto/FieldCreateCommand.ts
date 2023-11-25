import EventCommand from "../../event/dto/EventCommand";
import FieldTableElementCreateCommand from "../../fieldTableElement/dto/FieldTableElementCreateCommand";
import { IField } from "../field.model";

type FieldCreateCommand = {
  name: string;
  type: IField["type"];
  canChooseFromExistingFiles: boolean;
  fieldEvents: EventCommand[];
  options?: {
    label: string;
    value: string;
  }[];
  tableOptions: {
    name: string;
    columns: FieldTableElementCreateCommand[];
    rows: FieldTableElementCreateCommand[];
    yearTable: boolean;
  };
  language: string;
};

export default FieldCreateCommand;
