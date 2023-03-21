import { IField } from "../field.model";

type FieldReadDto = {
  _id: IField["_id"];
  name: IField["name"];
  type: IField["type"];
};

export const toReadDto = (field: IField): FieldReadDto => {
  return {
    _id: field._id,
    name: field.name,
    type: field.type,
  };
};

export default FieldReadDto;
