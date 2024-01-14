import request from "supertest";
import RoleCreateCommand from "../elements/role/dto/RoleCreateCommand";
import { IRole, Permission } from "../elements/role/role.model";
import app from "../server";
import userService from "../elements/user/user.service";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
} from "./fixtures";
import ResponseDto from "../globalTypes/ResponseDto";
import RoleReadDto from "../elements/role/dto/RoleReadDto";
import roleRepository from "../elements/role/role.repository";
import EntityCreateCommand, {
  EntityFieldValueCommand,
} from "../elements/entity/dto/EntityCreateCommand";
import { IField } from "../elements/field/field.model";
import fieldRepository from "../elements/field/field.repository";
import modelRepository from "../elements/model/model.repository";
import { IModel } from "../elements/model/model.model";
import { IEntity } from "../elements/entity/entity.model";
import entityRepository from "../elements/entity/entity.repository";
import { StaticPermission } from "../elements/entityPermission/entityPermission.model";
import RoleUpdateCommand from "../elements/role/dto/RoleUpdateCommand";
import RolesGetCommand from "../elements/role/dto/RolesGetCommand";
import PaginationResponse from "../globalTypes/PaginationResponse";
import RolesSearchCommand from "../elements/role/dto/RolesSearchCommand";

jest.setTimeout(50000);
describe("roles", () => {
  const adminToken = userService.generateToken(adminUser);
  const roleToSearchName = "To find by search";
  let createdRole: RoleReadDto | undefined;
  let field1: IField | undefined;
  let field2: IField | undefined;
  let model: IModel | undefined;
  let entity: IEntity | undefined;
  let roleToUpdate: IRole | undefined;
  let roleToDelete: IRole | undefined;
  let roleToSearch: IRole | undefined;

  const createCreateRoleCommand = (roleName?: string) => {
    const command: RoleCreateCommand = {
      entityPermissions: [
        {
          entityEventNotifications: [],
          entityFieldPermissions: [
            {
              fieldId: (field1 as IField)?._id.toString(),
              permissions: [StaticPermission.Read],
            },
          ],
          entityUserAssignmentPermissionsByRole: {
            canAssignToUserFromSameRole: true,
            otherRolesIds: [],
          },
          language: "en",
          modelId: model?._id.toString() || "",
          permissions: [StaticPermission.Read, StaticPermission.Update],
        },
      ],
      language: "en",
      name: roleName || "Role Created by Cypress",
      permissions: [Permission.CreateField, Permission.CreateModel],
    };

    return command;
  };

  beforeAll(async () => {
    const promises: Promise<IField>[] = [];
    promises.push(
      fieldRepository.create(createCreateFieldCommand("Entity test Field1")),
      fieldRepository.create(createCreateFieldCommand("Entity test Field2"))
    );

    const res = await Promise.all(promises);
    field1 = res[0];
    field2 = res[1];

    model = await modelRepository.create(
      createCreateModelCommand("Entity test model", [field1, field2])
    );

    const entityField1ValueCommand1: EntityFieldValueCommand = {
      fieldId: field1._id,
      files: [],
      tableValues: [],
      value: "Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: EntityFieldValueCommand = {
      fieldId: field2._id,
      files: [],
      tableValues: [],
      value: "Value 2",
      yearTableValues: [],
    };
    const createEntityCommand: EntityCreateCommand = {
      assignedUsersIds: [],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: model._id,
    };
    entity = await entityRepository.create(createEntityCommand);

    roleToUpdate = await roleRepository.create(createCreateRoleCommand());
    roleToDelete = await roleRepository.create(createCreateRoleCommand());
    roleToSearch = await roleRepository.create(
      createCreateRoleCommand(roleToSearchName)
    );
  });

  afterAll(async () => {
    const promises: Promise<any>[] = [];
    if (field1) {
      promises.push(fieldRepository.deleteFields([field1._id]));
    }
    if (field2) {
      promises.push(fieldRepository.deleteFields([field2._id]));
    }
    if (model) {
      promises.push(modelRepository.deleteModels([model._id]));
    }
    if (entity) {
      promises.push(entityRepository.deleteEntities([entity._id]));
    }
    if (createdRole) {
      promises.push(roleRepository.deleteRoles([createdRole._id]));
    }
    if (roleToUpdate) {
      promises.push(roleRepository.deleteRoles([roleToUpdate._id]));
    }
    if (roleToDelete) {
      promises.push(roleRepository.deleteRoles([roleToDelete._id]));
    }
    if (roleToSearch) {
      promises.push(roleRepository.deleteRoles([roleToSearch._id]));
    }

    await Promise.all(promises);
  });

  it("should create a role", () => {
    const command: RoleCreateCommand = createCreateRoleCommand();

    return request(app)
      .post("/roles/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<RoleReadDto> = res.body;

        createdRole = result.data as RoleReadDto;

        expect(result.success).toBeTruthy();
        expect(result.data?.name.at(0)?.text).toEqual(command.name);
        expect(result.data?.permissions.length).toEqual(
          command.permissions.length
        );
        command.permissions.forEach((permission) => {
          const foundPermission: boolean = Boolean(
            result.data?.permissions.some((el) => el === permission)
          );
          expect(foundPermission).toBeTruthy();
        });
        // An example of a permission that shouldn't be found
        const foundPermissionCreateUser: boolean = Boolean(
          result.data?.permissions.some((el) => el === Permission.CreateUser)
        );
        expect(foundPermissionCreateUser).toEqual(false);
        expect(result.data?.entityPermissions.length).toEqual(1);
        expect(
          result.data?.entityPermissions.at(0)?.model._id.toString()
        ).toEqual(command.entityPermissions.at(0)?.modelId.toString());
        expect(result.data?.permissions.length).toEqual(
          command.permissions.length
        );
        expect(
          result.data?.entityPermissions.at(0)?.entityFieldPermissions.length
        ).toEqual(
          command.entityPermissions.at(0)?.entityFieldPermissions.length
        );
      });
  });

  it("should update a role", () => {
    const command: RoleUpdateCommand = {
      _id: (roleToUpdate as IRole)?._id.toString(),
      language: "en",
      name: "UpdatedRoleName",
      entityPermissions: [
        {
          entityEventNotifications: [],
          entityFieldPermissions: [
            {
              fieldId: (field1 as IField)?._id.toString(),
              permissions: [StaticPermission.Read, StaticPermission.Update],
            },
          ],
          entityUserAssignmentPermissionsByRole: {
            canAssignToUserFromSameRole: false,
            otherRolesIds: [],
          },
          language: "en",
          modelId: model?._id.toString() || "",
          permissions: [StaticPermission.Create, StaticPermission.Update],
        },
      ],
      permissions: [
        Permission.CreateModel,
        Permission.CreateField,
        Permission.UpdateField,
        Permission.UpdateModel,
      ],
    };
    return request(app)
      .put("/roles/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<RoleReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.name.at(0)?.text).toEqual(command.name);
        expect(
          result.data?.entityPermissions.at(0)?.entityFieldPermissions.at(0)
            ?.permissions.length
        ).toEqual(2);
        expect(
          result.data?.entityPermissions.at(0)
            ?.entityUserAssignmentPermissionsByRole?.canAssignToUserFromSameRole
        ).toEqual(false);
        expect(result?.data?.permissions.length).toEqual(
          command.permissions.length
        );
      });
  });

  it("should get roles", () => {
    const command: RolesGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/roles/getRoles")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<RoleReadDto>> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(expect.any(Number));
        expect(result.data?.total).toBeGreaterThan(0);
        expect(result.data?.data.length).toBeGreaterThan(0);
      });
  });

  it("should delete a role", async () => {
    const res = await request(app)
      .delete("/roles/")
      .send([roleToDelete?._id])
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    const result: ResponseDto<void> = res.body;

    const command: RolesGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    expect(result.success).toBeTruthy();
    return request(app)
      .post("/roles/getRoles")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<RoleReadDto>> = res.body;

        const foundDeletedRole: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === roleToDelete?._id.toString()
          )
        );

        expect(foundDeletedRole).toEqual(false);
      });
  });

  it("should find searched role", () => {
    const command: RolesSearchCommand = {
      name: roleToSearchName,
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/roles/search")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<RoleReadDto>> = res.body;

        const foundRole: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === roleToSearch?._id.toString()
          )
        );

        expect(foundRole).toBeTruthy();
        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(expect.any(Number));
        expect(result.data?.data.length).toBeGreaterThan(0);
      });
  });
});
