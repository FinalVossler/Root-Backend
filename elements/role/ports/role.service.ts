import {
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
  SuperRoleEnum,
} from "roottypes";

import IRole from "./interfaces/IRole";
import IRoleService from "./interfaces/IRoleService";
import IRoleRepository from "./interfaces/IRoleRepository";
import IUser from "../../user/ports/interfaces/IUser";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";
import IModel from "../../model/ports/interfaces/IModel";
import IEntityPermissionService from "../../entityPermission/ports/interfaces/IEntityPermissionService";

const createRoleService = (
  roleRepository: IRoleRepository,
  entityPermissionService: IEntityPermissionService
): IRoleService => ({
  createRole: async function (
    command: IRoleCreateCommand,
    currentUser: IUser
  ): Promise<IRole> {
    this.roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateRole,
    });

    const role: IRole = await roleRepository.create(command);

    return role;
  },
  updateRole: async function (
    command: IRoleUpdateCommand,
    currentUser: IUser
  ): Promise<IRole> {
    this.roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdateRole,
    });
    const role: IRole = await roleRepository.update(command);

    return role;
  },
  getRoles: async function (
    command: IRolesGetCommand,
    currentUser: IUser
  ): Promise<{ roles: IRole[]; total: number }> {
    // Code commented. Roles should always be activated. We need to get the roles when assigning entities to users by roles
    // roleService.checkPermission({
    //   user: currentUser,
    //   permission: Permission.ReadRole,
    // });

    const { roles, total } = await roleRepository.getRoles(command);

    return { roles, total };
  },
  deleteRoles: async function (
    rolesIds: string[],
    currentUser: IUser
  ): Promise<void> {
    this.roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteRole,
    });

    await roleRepository.deleteRoles(rolesIds);
  },
  searchRoles: async function (
    command: IRolesSearchCommand,
    currentUser: IUser
  ): Promise<{ roles: IRole[]; total: number }> {
    this.roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.ReadRole,
    });

    const { roles, total } = await roleRepository.search(command);

    return { roles, total };
  },
  checkEntityPermission: function ({
    user,
    modelId,
    staticPermission,
  }: {
    user: IUser;
    modelId: string;
    staticPermission: StaticPermissionEnum;
  }): boolean {
    if (user.superRole === SuperRoleEnum.SuperAdmin) {
      return true;
    }

    const hasAccess: boolean = Boolean(
      ((user.role as IRole)?.entityPermissions as IEntityPermission[])
        .find(
          (entityPermission: IEntityPermission) =>
            (entityPermission.model as IModel)._id.toString() === modelId
        )
        ?.permissions.find((p) => p === staticPermission)
    );

    if (!hasAccess) {
      throw new Error("Permission denied");
    }

    return hasAccess;
  },
  checkPermission: function ({
    user,
    permission,
  }: {
    user?: IUser;
    permission: PermissionEnum;
  }): boolean {
    if (!user) {
      throw new Error("Permission denied");
    }

    if (user.superRole === SuperRoleEnum.SuperAdmin) {
      return true;
    }

    if (
      !Boolean(
        user.role &&
          (user.role as IRole).permissions &&
          (user.role as IRole)?.permissions.indexOf(permission) > -1
      )
    ) {
      throw new Error("Permission denied");
    }

    return true;
  },
  getRolesWithEntityPermissionsForModel: async function (
    modelId: string
  ): Promise<IRole[]> {
    const entityPermissions: IEntityPermission[] =
      await entityPermissionService.getModelEntityPermissions(modelId);

    const roles: IRole[] = await roleRepository.getRolesWithEntityPermissions(
      entityPermissions.map((el) => el._id.toString())
    );
    return roles;
  },
});

export default createRoleService;
