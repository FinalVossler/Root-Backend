import mongoose from "mongoose";

import { IRole } from "./role.model";
import Role from "./role.model";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import RoleCreateCommand from "./dto/RoleCreateCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";

const roleRepository = {
  create: async (command: RoleCreateCommand): Promise<IRole> => {
    const role: IRole = await Role.create({
      name: [{ language: command.language, text: command.name }],
    });

    return role;
  },
  update: async (command: RoleUpdateCommand): Promise<IRole> => {
    const role: IRole = await Role.findById(command._id);

    await Role.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: role.name,
          }),
        },
      }
    );

    const newRole: IRole = await Role.findById(command._id);

    return newRole;
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
      .limit(command.paginationCommand.limit);

    const total = await Role.find({
      name: { $elemMatch: { text: { $regex: command.name } } },
    }).count();

    return { roles, total };
  },
};

export default roleRepository;
