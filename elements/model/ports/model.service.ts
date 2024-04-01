import {
  IModelCreateCommand,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
} from "roottypes";

import IModelService from "./interfaces/IModelService";
import IModel from "./interfaces/IModel";
import IUser from "../../user/ports/interfaces/IUser";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IRole from "../../role/ports/interfaces/IRole";
import IModelRepository from "./interfaces/IModelRepository";
import IEntityPermissionService from "../../entityPermission/ports/interfaces/IEntityPermissionService";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";
import IEntityPermissionRepository from "../../entityPermission/ports/interfaces/IEntityPermissionRepository";
import IModelStateRepository from "../../modelState/ports/interfaces/IModelStateRepository";
import IEntityRepository from "../../entity/ports/interfaces/IEntityRepository";

const createModelService = (
  roleService: IRoleService,
  modelRepository: IModelRepository,
  entityPermissionService: IEntityPermissionService,
  entityPermissionRepository: IEntityPermissionRepository,
  modelStateRepository: IModelStateRepository,
  entityRepository: IEntityRepository
): IModelService => ({
  createModel: async (
    command: IModelCreateCommand,
    currentUser: IUser
  ): Promise<IModel> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateModel,
    });

    const model: IModel = await modelRepository.create(
      command,
      currentUser._id.toString()
    );

    return model;
  },
  updateModel: async (
    command: IModelUpdateCommand,
    currentUser: IUser
  ): Promise<IModel> => {
    const model: IModel = await modelRepository.getById(command._id);

    if (!model) {
      throw new Error("Model not not found");
    }

    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdateModel,
      elementsOwners: [model.owner],
      ownerPermission: PermissionEnum.UpdateOwnModel,
    });
    const updatedModel: IModel = await modelRepository.update(command);

    return updatedModel;
  },
  getModels: async function (
    command: IModelsGetCommand,
    currentUser: IUser
  ): Promise<{ models: IModel[]; total: number }> {
    // Models are always parsed at the beginning for the menu, so we need a try and catch for permission checking in case we don't have direct access to them.
    try {
      roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadModel,
        ownerPermission: PermissionEnum.ReadOwnModel,
      });
    } catch (e) {
      // If we can't read the models, we should at least be able to read the entities to which we have read access (and that are based on the models)
      const { models, total } = await this.getModelsByIds(
        command,
        ((currentUser?.role as IRole)?.entityPermissions as IEntityPermission[])
          ?.filter(
            (ePermission) =>
              ePermission.permissions.indexOf(StaticPermissionEnum.Read) !== -1
          )
          .map((ePermission) => (ePermission.model as IModel)._id.toString()) ||
          []
      );

      return {
        models,
        total,
      };
    }

    if (
      roleService.hasPermission({
        user: currentUser,
        permission: PermissionEnum.ReadModel,
      })
    ) {
      const { models, total } = await modelRepository.getModels(command);

      return { models, total };
    } else {
      const { models, total } = await modelRepository.getOwnModels(
        command,
        currentUser._id.toString()
      );

      return { models, total };
    }
  },
  getById: async (id: string): Promise<IModel> => {
    return await modelRepository.getById(id);
  },
  getModelsByIds: async (
    command: IModelsGetCommand,
    ids: string[]
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.getModelsByIds(
      command,
      ids
    );

    return { models, total };
  },
  deleteModels: async (
    modelsIds: string[],
    currentUser: IUser
  ): Promise<void> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteModel,
    });

    for (let i = 0; i < modelsIds.length; i++) {
      const model: IModel | undefined = await modelRepository.getById(
        modelsIds[i]
      );

      if (model) {
        // Deleting the entities created based on the deleted model
        await entityRepository.deleteByModel(model._id);

        // Deleting the entities permissions using the deleted model
        const modelEntityPermissions: IEntityPermission[] =
          await entityPermissionService.getModelEntityPermissions(
            model._id.toString()
          );

        await entityPermissionRepository.deleteByIds(
          modelEntityPermissions.map((ep) => ep._id.toString())
        );

        // Delete model modelField states
        let statesIds: string[] = [];
        model.modelFields?.forEach((modelField) => {
          statesIds = statesIds.concat(
            modelField.states?.map((state) => state._id) || []
          );
        });
        if (statesIds.length > 0) {
          await modelStateRepository.deleteMany(statesIds);
        }
      }

      await modelRepository.deleteModel(modelsIds[i]);
    }
  },
  searchModels: async (
    command: IModelsSearchCommand,
    currentUser: IUser
  ): Promise<{ models: IModel[]; total: number }> => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.ReadModel,
    });

    const { models, total } = await modelRepository.search(command);

    return { models, total };
  },
});

export default createModelService;
