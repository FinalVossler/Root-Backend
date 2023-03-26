import { IField } from "../field.model";

type FieldReadDto = {
  _id: IField["_id"];
  name: IField["name"];
  type: IField["type"];
  options?: IField["options"];

  createdAt: IField["createdAt"];
  updatedAt: IField["updatedAt"];
};

export const toReadDto = (field: IField): FieldReadDto => {
  return {
    _id: field._id,
    name: field.name,
    type: field.type,
    options: field.options,

    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
};

export default FieldReadDto;
