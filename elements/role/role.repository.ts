import mongoose from "mongoose";

import { IRole } from "./role.model";
import Role from "./role.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionRepository from "../entityPermission/entityPermission.repository";
import {
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";

const roleRepository = {
  createEntityPermissions: async (
    command: IEntityPermissionCreateCommand[]
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
    commands: (IEntityPermissionUpdateCommand | undefined)[],
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
  create: async (command: IRoleCreateCommand): Promise<IRole> => {
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
  update: async (command: IRoleUpdateCommand): Promise<IRole> => {
    const role: IRole | null = await Role.findById(command._id).populate(
      populationOptions
    );

    if (!role) {
      throw new Error("Role not found");
    }

    // Start entity permissions to delete
    const entityPermissionsToDelete: IEntityPermission[] = (
      role.entityPermissions as IEntityPermission[]
    ).filter(
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
    const entityPermissionsToUpdate: IEntityPermission[] = (
      role.entityPermissions as IEntityPermission[]
    ).filter((existing) =>
      command.entityPermissions.find(
        (toAdd) => toAdd._id === existing._id.toString()
      )
    );

    const entityPermissionsUpdateCommands: (
      | IEntityPermissionUpdateCommand
      | undefined
    )[] = entityPermissionsToUpdate.map((entityPermission) => {
      const updateCommand: IEntityPermissionUpdateCommand | undefined =
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
    const entityPermissionsToCreate: IEntityPermissionCreateCommand[] =
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
    command: IRolesGetCommand
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
  deleteRoles: async (rolesIds: string[]): Promise<null> => {
    for (let i = 0; i < rolesIds.length; i++) {
      await Role.deleteOne({ _id: new mongoose.Types.ObjectId(rolesIds[i]) });
    }

    return null;
  },
  search: async (
    command: IRolesSearchCommand
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

export const populationOptions = [
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
