import mongoose from "mongoose";
import FieldCreateCommand from "./dto/FieldCreateCommand";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import FieldsSearchCommand from "./dto/FieldsSearchCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import { IField } from "./field.model";
import fieldRepository from "./field.repository";

const fieldService = {
  createField: async (command: FieldCreateCommand): Promise<IField> => {
    const field: IField = await fieldRepository.create(command);

    return field;
  },
  updateField: async (command: FieldUpdateCommand): Promise<IField> => {
    const field: IField = await fieldRepository.update(command);

    return field;
  },
  getFields: async (
    command: FieldsGetCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const { fields, total } = await fieldRepository.getFields(command);

    return { fields, total };
  },
  deleteFields: async (fieldsIds: mongoose.ObjectId[]): Promise<void> => {
    await fieldRepository.deleteFields(fieldsIds);
  },

  search: async (
    command: FieldsSearchCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const { fields, total } = await fieldRepository.search(command);

    return { fields, total };
  },
};

export default fieldService;
