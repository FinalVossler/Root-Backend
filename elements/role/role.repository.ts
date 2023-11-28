import mongoose from "mongoose";

import { IRole } from "./role.model";
import Role from "./role.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import RoleCreateCommand from "./dto/RoleCreateCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionRepository from "../entityPermission/entityPermission.repository";
import EntityPermissionCreateCommand from "../entityPermission/dto/EntityPermissionCreateCommand";
import EntityPermissionUpdateCommand from "../entityPermission/dto/EntityPermissionUpdateCommand";

const roleRepository = {
  createEntityPermissions: async (
    command: EntityPermissionCreateCommand[]
  ): Promise<IEntityPermission[]> => {
    const entityPermissionsCreationPromises: Promise<IEntityPermission>[] = [];
    const createdEntityPermissions: IEntityPermission[] = [];

    command.forEach((entityPermissionCreateCommand) => {
      entityPermissionsCreationPromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const createdEntityPermission: IEntityPermission =
              await entityPermissionRepository.create(
                entityPermissionCreateCommand
              );
            createdEntityPermissions.push(createdEntityPermission);
            resolve(createdEntityPermission);
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    await Promise.all(entityPermissionsCreationPromises);

    return createdEntityPermissions;
  },
  updateEntityPermissions: async (
    commands: (EntityPermissionUpdateCommand | undefined)[],
    oldEntityPermissions: IEntityPermission[]
  ): Promise<IEntityPermission[]> => {
    const entityPermissionsUpdatePromises: Promise<IEntityPermission>[] = [];
    const updatedEntityPermissions: IEntityPermission[] = [];

    commands.forEach((entityPermissionCommand) => {
      entityPermissionsUpdatePromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const oldEntityPermission: IEntityPermission | undefined =
              oldEntityPermissions.find(
                (el) => el._id.toString() === entityPermissionCommand?._id
              );
            if (oldEntityPermission) {
              if (entityPermissionCommand) {
                const updatedEntityPermission: IEntityPermission =
                  await entityPermissionRepository.updateEntityPermission(
                    entityPermissionCommand,
                    oldEntityPermission
                  );
                updatedEntityPermissions.push(updatedEntityPermission);
                resolve(updatedEntityPermission);
              } else {
                reject(null);
              }
            } else {
              reject(null);
            }
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    await Promise.all(entityPermissionsUpdatePromises);

    return updatedEntityPermissions;
  },
  create: async (command: RoleCreateCommand): Promise<IRole> => {
    const createdEntityPermissions: IEntityPermission[] =
      await roleRepository.createEntityPermissions(command.entityPermissions);

    const role = await Role.create({
      name: [{ language: command.language, text: command.name }],
      permissions: command.permissions,
      entityPermissions: createdEntityPermissions,
    });

    const createdRole: IRole | null = await Role.findById(role._id).populate(
      populationOptions
    );

    if (!createdRole) {
      throw new Error("Role not found after creation");
    }
    return createdRole;
  },
  update: async (command: RoleUpdateCommand): Promise<IRole> => {
    const role: IRole | null = await Role.findById(command._id).populate(
      populationOptions
    );

    if (!role) {
      throw new Error("Role not found");
    }

    // Start entity permissions to delete
    const entityPermissionsToDelete: IEntityPermission[] =
      role.entityPermissions.filter(
        (existing) =>
          !command.entityPermissions.find(
            (toAdd) => toAdd._id === existing._id.toString()
          )
      );

    await entityPermissionRepository.deleteByIds(
      entityPermissionsToDelete.map((e) => e._id.toString())
    );
    // End entity permissions to delete

    // Start entity permissions to update
    const entityPermissionsToUpdate: IEntityPermission[] =
      role.entityPermissions.filter((existing) =>
        command.entityPermissions.find(
          (toAdd) => toAdd._id === existing._id.toString()
        )
      );

    const entityPermissionsUpdateCommands: (
      | EntityPermissionUpdateCommand
      | undefined
    )[] = entityPermissionsToUpdate.map((entityPermission) => {
      const updateCommand: EntityPermissionUpdateCommand | undefined =
        command.entityPermissions.find(
          (el) => el._id?.toString() === entityPermission._id.toString()
        );

      return updateCommand;
    });
    const updatedEntityPermissions: IEntityPermission[] =
      await roleRepository.updateEntityPermissions(
        entityPermissionsUpdateCommands,
        entityPermissionsToUpdate
      );
    // End entity permissions to update

    // Start entity permissions to create
    const entityPermissionsToCreate: EntityPermissionCreateCommand[] =
      command.entityPermissions.filter((toAdd) => !toAdd._id);

    const createdEntityPermissions: IEntityPermission[] =
      await roleRepository.createEntityPermissions(entityPermissionsToCreate);
    // End entity permissions to create

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
          entityPermissions: [
            ...updatedEntityPermissions.map((el) => el._id),
            ...createdEntityPermissions.map((el) => el._id),
          ],
        },
      }
    );

    const newRole = await Role.findById(command._id).populate(
      populationOptions
    );

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
  deleteRoles: async (rolesIds: mongoose.Types.ObjectId[]): Promise<null> => {
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
  getRolesWithEntityPermissions: async (
    entityPermissionsIds: string[]
  ): Promise<IRole[]> => {
    const roles: IRole[] = await Role.find({
      entityPermissions: {
        $in: entityPermissionsIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    }).populate(populationOptions);

    return roles;
  },
};

const populationOptions = [
  {
    path: "entityPermissions",
    model: "entityPermission",
    populate: [
      {
        path: "model",
        model: "model",
        populate: {
          path: "modelFields",
          populate: {
            path: "field",
            model: "field",
          },
        },
      },
      {
        path: "entityFieldPermissions",
        model: "field",
        populate: {
          path: "field",
          model: "field",
        },
      },
      {
        path: "entityUserAssignmentPermissionsByRole",
        populate: {
          path: "otherRoles",
          model: "role",
        },
      },
    ],
  },
];

export default roleRepository;
