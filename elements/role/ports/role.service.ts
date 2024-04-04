import {
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  EntityStaticPermissionEnum,
  SuperRoleEnum,
} from "roottypes";

import IRole from "./interfaces/IRole";
import IRoleService from "./interfaces/IRoleService";
import IRoleRepository from "./interfaces/IRoleRepository";
import IUser from "../../user/ports/interfaces/IUser";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";
import IModel from "../../model/ports/interfaces/IModel";
import IEntityPermissionService from "../../entityPermission/ports/interfaces/IEntityPermissionService";
import { getElementId } from "../../../utils/getElement";

const createRoleService = (
  roleRepository: IRoleRepository,
  entityPermissionService: IEntityPermissionService
): IRoleService => ({
  createRole: async function (
    command: IRoleCreateCommand,
    currentUser: IUser
  ): Promise<IRole> {
    this.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateRole,
    });

    const role: IRole = await roleRepository.create(command);

    return role;
  },
  updateRole: async function (command: IRoleUpdateCommand, currentUser: IUser) {
    this.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdateRole,
    });
    const role = await roleRepository.update(command);

    if (!role) throw new Error("Role not found");

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
    this.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteRole,
    });

    await roleRepository.deleteRoles(rolesIds);
  },
  searchRoles: async function (
    command: IRolesSearchCommand,
    currentUser: IUser
  ): Promise<{ roles: IRole[]; total: number }> {
    this.checkPermission({
      user: currentUser,
      permission: PermissionEnum.ReadRole,
    });

    const { roles, total } = await roleRepository.search(command);

    return { roles, total };
  },
  hasEntityPermission: function ({
    user,
    modelId,
    staticPermission,
    entitiesOwners,
    ownerPermission,
  }: {
    user: IUser;
    modelId: string;
    staticPermission: EntityStaticPermissionEnum;

    entitiesOwners?: (IUser | string | undefined)[];
    ownerPermission?: EntityStaticPermissionEnum;
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
      if (entitiesOwners && entitiesOwners.length > 0 && ownerPermission) {
        const isOwner = entitiesOwners.every(
          (owner) => getElementId(owner) === user._id.toString()
        );

        if (isOwner) {
          return (this as IRoleService).hasEntityPermission({
            user,
            modelId,
            staticPermission: ownerPermission,
          });
        } else {
          return false;
        }
      }
      if (
        ownerPermission &&
        (!entitiesOwners || entitiesOwners?.length === 0)
      ) {
        return (this as IRoleService).hasEntityPermission({
          user,
          modelId,
          staticPermission: ownerPermission,
        });
      }

      return false;
    }

    return hasAccess;
  },
  checkEntityPermission: function ({
    user,
    modelId,
    staticPermission,
    entitiesOwners,
    ownerPermission,
  }: {
    user: IUser;
    modelId: string;
    staticPermission: EntityStaticPermissionEnum;
    entitiesOwners?: (IUser | string | undefined)[];
    ownerPermission?: EntityStaticPermissionEnum;
  }): never | void {
    if (
      !(this as IRoleService).hasEntityPermission({
        user,
        modelId,
        staticPermission,
        entitiesOwners,
        ownerPermission,
      })
    ) {
      throw new Error("Permission denied");
    }
  },
  hasPermission: function ({
    user,
    permission,
    elementsOwners,
    ownerPermission,
  }: {
    user?: IUser;
    permission: PermissionEnum;
    elementsOwners?: (string | IUser | undefined)[];

    ownerPermission?: PermissionEnum;
  }): boolean {
    if (!user) {
      return false;
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
      // If the permission isn't met, but we passed the elements owners and the owner permission, then we are trying to access a single entity.
      // We should then check if the user is the actual owner of all elements and if the owner permission is checked.
      if (elementsOwners && elementsOwners.length > 0 && ownerPermission) {
        const isOwnerOfAllElements: boolean = elementsOwners.every(
          (owner) =>
            (typeof owner === "string" ? owner : owner?._id.toString()) ===
            user._id.toString()
        );

        if (!isOwnerOfAllElements) return false;
        else
          return (this as IRoleService).hasPermission({
            user,
            permission: ownerPermission,
          });
      }
      // If the owner isn't defined, but we passed the ownerPermission, then we are trying to only read one's own elements.
      // Check if one's own elements are permitted.
      if ((!elementsOwners || elementsOwners.length === 0) && ownerPermission) {
        return (this as IRoleService).hasPermission({ user, permission });
      }

      return false;
    }

    return true;
  },
  checkPermission: function ({
    user,
    permission,
    elementsOwners,
    ownerPermission,
  }: {
    user?: IUser;
    permission: PermissionEnum;
    elementsOwners?: (string | IUser | undefined)[];
    ownerPermission?: PermissionEnum;
  }): never | void {
    if (
      !(this as IRoleService).hasPermission({
        user,
        permission,
        elementsOwners,
        ownerPermission,
      })
    ) {
      throw new Error("Permission denied");
    }
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
