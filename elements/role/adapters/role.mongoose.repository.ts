import mongoose from "mongoose";

import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import entityPermissionMongooseRepository from "../../entityPermission/adapters/entityPermission.mongoose.repository";
import {
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";
import IRole from "../ports/interfaces/IRole";
import Role from "./role.mongoose.model";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";

const roleMongooseRepository = {
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
              await entityPermissionMongooseRepository.create(
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
                  await entityPermissionMongooseRepository.updateEntityPermission(
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
  create: async function (command: IRoleCreateCommand): Promise<IRole> {
    const createdEntityPermissions: IEntityPermission[] =
      await this.createEntityPermissions(command.entityPermissions);

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
  update: async function (command: IRoleUpdateCommand): Promise<IRole> {
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

    await entityPermissionMongooseRepository.deleteByIds(
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
      await this.updateEntityPermissions(
        entityPermissionsUpdateCommands,
        entityPermissionsToUpdate
      );
    // End entity permissions to update

    // Start entity permissions to create
    const entityPermissionsToCreate: IEntityPermissionCreateCommand[] =
      command.entityPermissions.filter((toAdd) => !toAdd._id);

    const createdEntityPermissions: IEntityPermission[] =
      await this.createEntityPermissions(entityPermissionsToCreate);
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
      // delete role entity permissions first
      const role: IRole = (await Role.findById(
        new mongoose.Types.ObjectId(rolesIds[i])
      )
        .populate(populationOptions)
        .exec()) as IRole;

      if (!role) continue;

      await entityPermissionMongooseRepository.deleteByIds(
        (role.entityPermissions as IEntityPermission[]).map((p) =>
          p._id.toString()
        )
      );

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

export default roleMongooseRepository;
