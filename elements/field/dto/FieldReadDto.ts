import { IFieldTableElement } from "../../fieldTableElement/fieldTableElement.model";
import { ITranslatedText } from "../../ITranslatedText";
import { IField } from "../field.model";

type FieldReadDto = {
  _id: IField["_id"];
  name: IField["name"];
  type: IField["type"];
  canChooseFromExistingFiles?: boolean;
  options?: IField["options"];
  fieldEvents: IField["fieldEvents"];
  tableOptions?: {
    name?: ITranslatedText[];
    columns: IFieldTableElement[];
    rows: IFieldTableElement[];
    yearTable: boolean;
  };

  createdAt: IField["createdAt"];
  updatedAt: IField["updatedAt"];
};

export const toReadDto = (field: IField): FieldReadDto => {
  return {
    _id: field._id,
    name: field.name,
    type: field.type,
    canChooseFromExistingFiles: field.canChooseFromExistingFiles,
    options: field.options,
    fieldEvents: field.fieldEvents || [],
    tableOptions: field.tableOptions,

    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
};

export default FieldReadDto;
