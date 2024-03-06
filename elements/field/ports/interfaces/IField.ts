import { FieldTypeEnum, ITranslatedText } from "roottypes";
import { IFieldTableElement } from "../../../fieldTableElement/adapters/fieldTableElement.mongoose.model";
import { IEvent } from "../../../event/adapters/event.mongoose.model";

export type IFieldOption = {
  value: string;
  label: ITranslatedText[];
};

export interface IField {
  _id: string;
  name: ITranslatedText[];
  type: FieldTypeEnum;
  canChooseFromExistingFiles?: boolean;
  options?: IFieldOption[];
  fieldEvents: IEvent[];
  tableOptions?: {
    name?: ITranslatedText[];
    columns: (IFieldTableElement | string)[];
    rows: (IFieldTableElement | string)[];
    yearTable: boolean;
  };

  createdAt: string;
  updatedAt: string;
}
