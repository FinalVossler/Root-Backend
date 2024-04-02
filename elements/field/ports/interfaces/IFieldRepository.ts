import {
  IFieldCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";

import { IField } from "./IField";

interface IFieldRepository {
  create: (command: IFieldCreateCommand, ownerId?: string) => Promise<IField>;
  update: (command: IFieldUpdateCommand) => Promise<IField>;
  getById: (id: string) => Promise<IField>;
  getFields: (
    command: IFieldsGetCommand,
    ownerId?: string
  ) => Promise<{ total: number; fields: IField[] }>;
  deleteFields: (fieldsIds: string[]) => Promise<void>;
  search: (
    command: IFieldsSearchCommand
  ) => Promise<{ fields: IField[]; total: number }>;
  getByIds: (ids: string[]) => Promise<IField[]>;
  copy: (ids: string[]) => Promise<IField[]>;
}

export default IFieldRepository;
