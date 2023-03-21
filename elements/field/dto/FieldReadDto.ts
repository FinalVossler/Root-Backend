import { IField } from "../field.model";

type FieldReadDto = {
  name: IField["name"];
  type: IField["type"];
};

export const toReadDto = (field: IField): FieldReadDto => {
  return {
    name: field.name,
    type: field.type,
  };
};

export default FieldReadDto;
