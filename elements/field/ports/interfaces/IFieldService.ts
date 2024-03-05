import {
  IFieldCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";
import { IField } from "./IField";
import { IUser } from "../../../user/adapters/user.mongoose.model";

export default interface IFieldService {
  createField: (
    command: IFieldCreateCommand,
    currentUser: IUser
  ) => Promise<IField>;
  updateField: (
    command: IFieldUpdateCommand,
    currentUser: IUser
  ) => Promise<IField>;
  getFields: (
    command: IFieldsGetCommand,
    currentUser: IUser
  ) => Promise<{ fields: IField[]; total: number }>;
  deleteFields: (fieldsIds: string[], currentUser: IUser) => Promise<void>;
  search: (
    command: IFieldsSearchCommand,
    currentUser: IUser
  ) => Promise<{ fields: IField[]; total: number }>;
  copy: (ids: string[], currentUser: IUser) => Promise<IField[]>;
}
