import mongoose from "mongoose";
import { IField } from "./field.model";
import fieldRepository from "./field.repository";
import {
  IFieldCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";

const fieldService = {
  createField: async (command: IFieldCreateCommand): Promise<IField> => {
    const field: IField = await fieldRepository.create(command);

    return field;
  },
  updateField: async (command: IFieldUpdateCommand): Promise<IField> => {
    const field: IField = await fieldRepository.update(command);

    return field;
  },
  getFields: async (
    command: IFieldsGetCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const { fields, total } = await fieldRepository.getFields(command);

    return { fields, total };
  },
  deleteFields: async (fieldsIds: string[]): Promise<void> => {
    await fieldRepository.deleteFields(fieldsIds);
  },
  search: async (
    command: IFieldsSearchCommand
  ): Promise<{ fields: IField[]; total: number }> => {
    const { fields, total } = await fieldRepository.search(command);

    return { fields, total };
  },
  copy: async (ids: string[]): Promise<IField[]> => {
    const fields: IField[] = await fieldRepository.copy(ids);

    return fields;
  },
};

export default fieldService;
