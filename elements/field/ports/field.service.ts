import {
  IFieldCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
  PermissionEnum,
} from "roottypes";
import IFieldRepository from "./interfaces/IFieldRepository";
import modelRepository from "../../model/adapters/model.mongoose.repository";
import fieldTableElementRepository from "../../fieldTableElement/fieldTableElement.repository";
import { IFieldTableElement } from "../../fieldTableElement/fieldTableElement.model";
import IFieldService from "./interfaces/IFieldService";
import { IField } from "./interfaces/IField";
import { IUser } from "../../user/adapters/user.mongoose.model";
import IRoleService from "../../role/ports/interfaces/IRoleService";

const createFieldService = (
  fieldRepository: IFieldRepository,
  roleService: IRoleService
): IFieldService => {
  return {
    createField: async (
      command: IFieldCreateCommand,
      currentUser: IUser
    ): Promise<IField> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.CreateField,
      });

      const field: IField = await fieldRepository.create(command);

      return field;
    },
    updateField: async (
      command: IFieldUpdateCommand,
      currentUser: IUser
    ): Promise<IField> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.UpdateField,
      });

      const field: IField = await fieldRepository.update(command);

      return field;
    },
    getFields: async (
      command: IFieldsGetCommand,
      currentUser: IUser
    ): Promise<{ fields: IField[]; total: number }> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadField,
      });

      const { fields, total } = await fieldRepository.getFields(command);

      return { fields, total };
    },
    deleteFields: async (
      fieldsIds: string[],
      currentUser: IUser
    ): Promise<void> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.DeleteField,
      });

      const cascadeDeletePromises: Promise<void>[] = [];

      fieldsIds.forEach(async (fieldId) => {
        cascadeDeletePromises.push(
          new Promise(async (resolve, reject) => {
            const field: IField = await fieldRepository.getById(fieldId);
            const models = await modelRepository.getModelsContainingField(
              fieldId
            );

            const promises: Promise<unknown>[] = [];
            models.forEach((model) => {
              const promise = new Promise(async (resolve, reject) => {
                const newModelFields = model.modelFields.filter(
                  (modelField) =>
                    (modelField.field as IField)._id.toString() !==
                    field._id.toString()
                );

                await modelRepository.updateModelFields({
                  modelId: model._id.toString(),
                  newModelFields,
                });

                resolve(null);
              });

              promises.push(promise);
            });

            await Promise.all(promises);

            // Delete field table elements on field deletion
            await fieldTableElementRepository.deleteMany(
              (
                field.tableOptions?.columns.map((c) =>
                  (c as IFieldTableElement)._id.toString()
                ) || []
              ).concat(
                field.tableOptions?.rows?.map((r) =>
                  (r as IFieldTableElement)._id.toString()
                ) || []
              )
            );

            resolve();
          })
        );
      });

      await Promise.all(cascadeDeletePromises);

      await fieldRepository.deleteFields(fieldsIds);
    },
    search: async (
      command: IFieldsSearchCommand,
      currentUser: IUser
    ): Promise<{ fields: IField[]; total: number }> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadField,
      });

      const { fields, total } = await fieldRepository.search(command);

      return { fields, total };
    },
    copy: async (ids: string[], currentUser: IUser): Promise<IField[]> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.CreateField,
      });

      const fields: IField[] = await fieldRepository.copy(ids);

      return fields;
    },
  };
};

export default createFieldService;
