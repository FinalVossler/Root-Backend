import request from "supertest";
import { IRole } from "../../elements/role/role.model";
import app from "../../server";
import userService from "../../elements/user/ports/user.service";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
} from "../fixtures";
import IResponseDto from "../../globalTypes/IResponseDto";
import roleRepository from "../../elements/role/adapters/role.mongoose.repository";
import modelRepository from "../../elements/model/adapters/model.mongoose.repository";
import { IModel } from "../../elements/model/adapters/model.mongoose.model";
import { IEntity } from "../../elements/entity/adapters/entity.mongoose.model";
import entityRepository from "../../elements/entity/adapters/entity.mongoose.repository";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import {
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityPermissionReadDto,
  IModelReadDto,
  IRoleCreateCommand,
  IRoleReadDto,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
} from "roottypes";
import { createMongooseFieldRepository } from "../../elements/field/adapters/field.mongoose.repository";
import { IField } from "../../elements/field/ports/interfaces/IField";

jest.setTimeout(50000);
const fieldRepository = createMongooseFieldRepository();
describe("roles", () => {
  const adminToken = userService.generateToken(adminUser);
  const roleToSearchName = "To find by search";
  let createdRole: IRoleReadDto | undefined;
  let field1: IField | undefined;
  let field2: IField | undefined;
  let model: IModel | undefined;
  let entity: IEntity | undefined;
  let roleToUpdate: IRole | undefined;
  let roleToDelete: IRole | undefined;
  let roleToSearch: IRole | undefined;

  const createCreateRoleCommand = (roleName?: string) => {
    const command: IRoleCreateCommand = {
      entityPermissions: [
        {
          entityEventNotifications: [],
          entityFieldPermissions: [
            {
              fieldId: (field1 as IField)?._id.toString(),
              permissions: [StaticPermissionEnum.Read],
            },
          ],
          entityUserAssignmentPermissionsByRole: {
            canAssignToUserFromSameRole: true,
            otherRolesIds: [],
          },
          language: "en",
          modelId: model?._id.toString() || "",
          permissions: [StaticPermissionEnum.Read, StaticPermissionEnum.Update],
        },
      ],
      language: "en",
      name: roleName || "Role Created by Integration tests",
      permissions: [PermissionEnum.CreateField, PermissionEnum.CreateModel],
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

    const entityField1ValueCommand1: IEntityFieldValueCommand = {
      fieldId: field1._id.toString(),
      files: [],
      tableValues: [],
      value: "Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: IEntityFieldValueCommand = {
      fieldId: field2._id.toString(),
      files: [],
      tableValues: [],
      value: "Value 2",
      yearTableValues: [],
    };
    const createEntityCommand: IEntityCreateCommand = {
      assignedUsersIds: [],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: model._id.toString(),
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
      promises.push(fieldRepository.deleteFields([field1._id.toString()]));
    }
    if (field2) {
      promises.push(fieldRepository.deleteFields([field2._id.toString()]));
    }
    if (model) {
      promises.push(modelRepository.deleteModels([model._id.toString()]));
    }
    if (entity) {
      promises.push(entityRepository.deleteEntities([entity._id.toString()]));
    }
    if (createdRole) {
      promises.push(roleRepository.deleteRoles([createdRole._id.toString()]));
    }
    if (roleToUpdate) {
      promises.push(roleRepository.deleteRoles([roleToUpdate._id.toString()]));
    }
    if (roleToDelete) {
      promises.push(roleRepository.deleteRoles([roleToDelete._id.toString()]));
    }
    if (roleToSearch) {
      promises.push(roleRepository.deleteRoles([roleToSearch._id.toString()]));
    }

    await Promise.all(promises);
  });

  it("should create a role", () => {
    const command: IRoleCreateCommand = createCreateRoleCommand();

    return request(app)
      .post("/roles/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IRoleReadDto> = res.body;

        createdRole = result.data as IRoleReadDto;

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
          result.data?.permissions.some(
            (el) => el === PermissionEnum.CreateUser
          )
        );
        expect(foundPermissionCreateUser).toEqual(false);
        expect(result.data?.entityPermissions.length).toEqual(1);
        expect(
          (
            (result.data?.entityPermissions as IEntityPermissionReadDto[]).at(0)
              ?.model as IModelReadDto
          )._id.toString()
        ).toEqual(command.entityPermissions.at(0)?.modelId.toString());
        expect(result.data?.permissions.length).toEqual(
          command.permissions.length
        );
        expect(
          (result.data?.entityPermissions as IEntityPermissionReadDto[]).at(0)
            ?.entityFieldPermissions.length
        ).toEqual(
          command.entityPermissions.at(0)?.entityFieldPermissions.length
        );
      });
  });

  it("should update a role", () => {
    const command: IRoleUpdateCommand = {
      _id: (roleToUpdate as IRole)?._id.toString(),
      language: "en",
      name: "UpdatedRoleName",
      entityPermissions: [
        {
          entityEventNotifications: [],
          entityFieldPermissions: [
            {
              fieldId: (field1 as IField)?._id.toString(),
              permissions: [
                StaticPermissionEnum.Read,
                StaticPermissionEnum.Update,
              ],
            },
          ],
          entityUserAssignmentPermissionsByRole: {
            canAssignToUserFromSameRole: false,
            otherRolesIds: [],
          },
          language: "en",
          modelId: model?._id.toString() || "",
          permissions: [
            StaticPermissionEnum.Create,
            StaticPermissionEnum.Update,
          ],
        },
      ],
      permissions: [
        PermissionEnum.CreateModel,
        PermissionEnum.CreateField,
        PermissionEnum.UpdateField,
        PermissionEnum.UpdateModel,
      ],
    };
    return request(app)
      .put("/roles/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IRoleReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.name.at(0)?.text).toEqual(command.name);
        expect(
          (result.data?.entityPermissions as IEntityPermissionReadDto[])
            .at(0)
            ?.entityFieldPermissions.at(0)?.permissions.length
        ).toEqual(2);
        expect(
          (result.data?.entityPermissions as IEntityPermissionReadDto[]).at(0)
            ?.entityUserAssignmentPermissionsByRole?.canAssignToUserFromSameRole
        ).toEqual(false);
        expect(result?.data?.permissions.length).toEqual(
          command.permissions.length
        );
      });
  });

  it("should get roles", () => {
    const command: IRolesGetCommand = {
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
        const result: IResponseDto<IPaginationResponse<IRoleReadDto>> =
          res.body;

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

    const result: IResponseDto<void> = res.body;

    const command: IRolesGetCommand = {
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
        const result: IResponseDto<IPaginationResponse<IRoleReadDto>> =
          res.body;

        const foundDeletedRole: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === roleToDelete?._id.toString()
          )
        );

        expect(foundDeletedRole).toEqual(false);
      });
  });

  it("should find searched role", () => {
    const command: IRolesSearchCommand = {
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
        const result: IResponseDto<IPaginationResponse<IRoleReadDto>> =
          res.body;

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
