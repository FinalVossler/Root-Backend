import mongoose from "mongoose";

import { IRole } from "./role.model";
import Role from "./role.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import RoleCreateCommand from "./dto/RoleCreateCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionRepository from "../entityPermission/entityPermissionRepository";
import EntityPermissionCreateCommand from "../entityPermission/dto/EntityPermissionCreateCommand";

const roleRepository = {
  createEntityPermissions: async (
    command: EntityPermissionCreateCommand[]
  ): Promise<IEntityPermission[]> => {
    const entityPermissionsCreationPromises: Promise<IEntityPermission>[] = [];
    const createdEntityPermissions: IEntityPermission[] = [];

    command.forEach((entityPermissionCommand) => {
      entityPermissionsCreationPromises.push(
        new Promise(async (resolve, reject) => {
          const command: EntityPermissionCreateCommand = {
            modelId: entityPermissionCommand.modelId,
            permissions: entityPermissionCommand.permissions,
          };
          const createdEntityPermission: IEntityPermission =
            await entityPermissionRepository.create(command);
          createdEntityPermissions.push(createdEntityPermission);
          resolve(createdEntityPermission);
        })
      );
    });

    await Promise.all(entityPermissionsCreationPromises);

    return createdEntityPermissions;
  },
  create: async (command: RoleCreateCommand): Promise<IRole> => {
    const createdEntityPermissions: IEntityPermission[] =
      await roleRepository.createEntityPermissions(command.entityPermissions);

    const role = await Role.create({
      name: [{ language: command.language, text: command.name }],
      permissions: command.permissions,
      entityPermissions: createdEntityPermissions,
    });

    role.populate(populationOptions);

    return role as IRole;
  },
  update: async (command: RoleUpdateCommand): Promise<IRole> => {
    const role: IRole = await Role.findById(command._id);

    await entityPermissionRepository.deleteByIds(
      role.entityPermissions.map((e) => e._id.toString())
    );

    const createdEntityPermissions: IEntityPermission[] =
      await roleRepository.createEntityPermissions(command.entityPermissions);

    await Role.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: role.name,
          }),
          permissions: command.permissions,
          entityPermissions: createdEntityPermissions,
        },
      }
    );

    const newRole = await Role.findById(command._id);

    newRole.populate(populationOptions);

    return newRole as IRole;
  },
  getRoles: async (
    command: RolesGetCommand
  ): Promise<{ total: number; roles: IRole[] }> => {
    const roles: IRole[] = await Role.find({})
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Role.find({}).count();

    return { roles, total };
  },
  deleteRoles: async (rolesIds: mongoose.ObjectId[]): Promise<void> => {
    for (let i = 0; i < rolesIds.length; i++) {
      await Role.deleteOne({ _id: rolesIds[i] });
    }

    return null;
  },
  search: async (
    command: RolesSearchCommand
  ): Promise<{ roles: IRole[]; total: number }> => {
    const query = Role.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    });

    const roles: IRole[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await Role.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { roles, total };
  },
};

const populationOptions = [
  {
    path: "entityPermissions",
    model: "entityPermission",
    populate: {
      path: "model",
      model: "model",
    },
  },
];

export default roleRepository;
