import { FieldTypeEnum, ITranslatedText } from "roottypes";

import { IEvent } from "../../../event/ports/interfaces/IEvent";
import IFieldTableElement from "../../../fieldTableElement/ports/IFieldTableElement";

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
