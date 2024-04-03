import {
  IFieldCreateCommand,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
  PermissionEnum,
} from "roottypes";

import IFieldRepository from "./interfaces/IFieldRepository";
import IFieldService from "./interfaces/IFieldService";
import { IField } from "./interfaces/IField";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IUser from "../../user/ports/interfaces/IUser";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";
import IModelRepository from "../../model/ports/interfaces/IModelRepository";
import IFieldTableElementRepository from "../../fieldTableElement/ports/IFieldTableElementRepository";

const createFieldService = (
  fieldRepository: IFieldRepository,
  roleService: IRoleService,
  modelRepository: IModelRepository,
  fieldTableElementRepository: IFieldTableElementRepository
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

      const field: IField = await fieldRepository.create(
        command,
        currentUser._id.toString()
      );

      return field;
    },
    updateField: async function (
      command: IFieldUpdateCommand,
      currentUser: IUser
    ): Promise<IField> {
      const field: IField = await fieldRepository.getById(command._id);

      if (!field) {
        throw new Error("Field not found");
      }

      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.UpdateField,
        elementsOwners: [field.owner],
        ownerPermission: PermissionEnum.UpdateOwnField,
      });

      const updatedField: IField = await fieldRepository.update(command);

      return updatedField;
    },
    getFields: async (
      command: IFieldsGetCommand,
      currentUser: IUser
    ): Promise<{ fields: IField[]; total: number }> => {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadField,
        ownerPermission: PermissionEnum.ReadOwnField,
      });

      if (
        roleService.hasPermission({
          user: currentUser,
          permission: PermissionEnum.ReadField,
        })
      ) {
        const { fields, total } = await fieldRepository.getFields(command);
        return { fields, total };
      } else {
        const { fields, total } = await fieldRepository.getFields(
          command,
          currentUser._id.toString()
        );
        return { fields, total };
      }
    },
    deleteFields: async (
      fieldsIds: string[],
      currentUser: IUser
    ): Promise<void> => {
      const fields = await fieldRepository.getByIds(fieldsIds);

      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.DeleteField,
        ownerPermission: PermissionEnum.DeleteOwnField,
        elementsOwners: fields.map((field) => field.owner),
      });

      const cascadeDeletePromises: Promise<void>[] = [];

      fieldsIds.forEach(async (fieldId) => {
        cascadeDeletePromises.push(
          new Promise(async (resolve, reject) => {
            const field: IField = await fieldRepository.getById(fieldId);
            const models = await modelRepository.getModelsContainingField(
              fieldId
            );

            // Delete model fields that are using the field
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
