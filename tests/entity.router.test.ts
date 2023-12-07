import request from "supertest";
import EntityCreateCommand, {
  EntityFieldValueCommand,
} from "../elements/entity/dto/EntityCreateCommand";
import { IEntity } from "../elements/entity/entity.model";
import entityRepository from "../elements/entity/entity.repository";
import { IField } from "../elements/field/field.model";
import fieldRepository from "../elements/field/field.repository";
import { IModel } from "../elements/model/model.model";
import modelRepository from "../elements/model/model.repository";
import {
  createCreateFieldCommand,
  createCreateModelCommand,
  adminUser,
} from "./fixtures";
import app from "../server";
import EntityReadDto from "../elements/entity/dto/EntityReadDto";
import ResponseDto from "../globalTypes/ResponseDto";
import userService from "../elements/user/user.service";
import EntityUpdateCommand from "../elements/entity/dto/EntityUpdateCommand";
import mongoose from "mongoose";
import { IUser, SuperRole } from "../elements/user/user.model";
import userRepository from "../elements/user/user.repository";
import UserCreateCommand from "../elements/user/dtos/UserCreateCommand";

describe("entity router", () => {
  let field1: IField | undefined;
  let field2: IField | undefined;
  let model: IModel | undefined;
  let entityToGetById: IEntity | undefined;
  let createdEntity: EntityReadDto | null;
  let entityToUpdate: IEntity | null;
  const adminToken: string = userService.generateToken(adminUser);
  let assignedUser1: IUser | undefined;
  let assignedUser2: IUser | undefined;

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
    entityToGetById = await entityRepository.create(createEntityCommand);
    entityToUpdate = await entityRepository.create(createEntityCommand);

    const assignedUser1CreateCommand: UserCreateCommand = {
      email: "assignedUser1@updating.com",
      firstName: "assignedUser1FirstName",
      lastName: "assignedUser1LastName",
      password: "assignedUser1Password",
      superRole: SuperRole.Normal,
    };
    assignedUser1 = await userRepository.create(assignedUser1CreateCommand);

    const assignedUser2CreateCommand: UserCreateCommand = {
      email: "assignedUser2@updating.com",
      firstName: "assignedUser2FirstName",
      lastName: "assignedUser2LastName",
      password: "assignedUser2Password",
      superRole: SuperRole.Normal,
    };
    assignedUser2 = await userRepository.create(assignedUser2CreateCommand);
  });

  afterAll(async () => {
    const promises: Promise<any>[] = [];
    if (entityToGetById) {
      promises.push(entityRepository.deleteEntities([entityToGetById._id]));
    }
    if (model) {
      promises.push(modelRepository.deleteModels([model._id]));
    }
    if (field1) {
      promises.push(fieldRepository.deleteFields([field1._id]));
    }
    if (field2) {
      promises.push(fieldRepository.deleteFields([field2._id]));
    }
    if (createdEntity) {
      promises.push(entityRepository.deleteEntities([createdEntity._id]));
    }
    if (entityToUpdate) {
      promises.push(entityRepository.deleteEntities([entityToUpdate._id]));
    }
    if (assignedUser1) {
      promises.push(userRepository.deleteByEmail(assignedUser1.email));
    }
    if (assignedUser2) {
      promises.push(userRepository.deleteByEmail(assignedUser2.email));
    }

    await Promise.all(promises);
  });

  it.skip("should get by id", () => {
    return request(app)
      .get("/entities/getEntity")
      .query({ entityId: entityToGetById?._id.toString() })
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: ResponseDto<EntityReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?._id.toString()).toEqual(
          entityToGetById?._id.toString()
        );
        expect(result.data?.entityFieldValues.length).toEqual(
          entityToGetById?.entityFieldValues.length
        );
        expect(result.data?.entityFieldValues[0].value.at(0)?.text).toEqual(
          entityToGetById?.entityFieldValues[0].value.at(0)?.text
        );
        expect(result.data?.entityFieldValues[1].value.at(0)?.text).toEqual(
          entityToGetById?.entityFieldValues[1].value.at(0)?.text
        );
        expect(result.data?.model._id.toString()).toEqual(
          entityToGetById?.model._id.toString()
        );
      });
  });

  it.skip("should create entity", () => {
    const entityField1ValueCommand1: EntityFieldValueCommand = {
      fieldId: (field1 as IField)._id,
      files: [],
      tableValues: [],
      value: "Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: EntityFieldValueCommand = {
      fieldId: (field2 as IField)._id,
      files: [],
      tableValues: [],
      value: "Value 2",
      yearTableValues: [],
    };
    const createEntityCommand: EntityCreateCommand = {
      assignedUsersIds: [],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: (model as IModel)._id,
    };
    return request(app)
      .post("/entities/")
      .send(createEntityCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<EntityReadDto> = res.body;

        createdEntity = result.data;

        expect(result.success).toBeTruthy();
        expect(result.data?.entityFieldValues.length).toEqual(
          createEntityCommand.entityFieldValues.length
        );
        expect(result.data?.entityFieldValues[0].value.at(0)?.text).toEqual(
          entityField1ValueCommand1.value
        );
        expect(result.data?.entityFieldValues[1].value.at(0)?.text).toEqual(
          entityField1ValueCommand2.value
        );
        expect(result.data?.model._id.toString()).toEqual(
          model?._id.toString()
        );
      });
  });

  it("should update an entity", async () => {
    const entityField1ValueCommand1: EntityFieldValueCommand = {
      fieldId: (field1 as IField)._id,
      files: [],
      tableValues: [],
      value: "updated Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: EntityFieldValueCommand = {
      fieldId: (field2 as IField)._id,
      files: [],
      tableValues: [],
      value: "updated Value 2",
      yearTableValues: [],
    };

    const command: EntityUpdateCommand = {
      _id: new mongoose.Types.ObjectId(entityToUpdate?._id || ""),
      assignedUsersIds: [(assignedUser1 as IUser)._id.toString()],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: (model as IModel)._id,
    };

    const res = await request(app)
      .put("/entities/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command);
    const result: ResponseDto<EntityReadDto> = res.body;

    expect(result.success).toBeTruthy();
    expect(result.data?.entityFieldValues.at(0)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand1.value
    );
    expect(result.data?.entityFieldValues.at(1)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand2.value
    );
    expect(result?.data?.assignedUsers.length).toEqual(1);
    expect(result?.data?.assignedUsers.at(0)?.email).toEqual(
      assignedUser1?.email
    );

    // Update in a different language:

    const field1InFrench = "Valeur en Français de field1";
    const field2InFrench = "Valeur en Français de field2";
    const commandInFrench: EntityUpdateCommand = {
      _id: new mongoose.Types.ObjectId(entityToUpdate?._id || ""),
      assignedUsersIds: [
        (assignedUser1 as IUser)._id.toString(),
        (assignedUser2 as IUser)._id.toString(),
      ],
      entityFieldValues: [
        { ...entityField1ValueCommand1, value: field1InFrench },
        { ...entityField1ValueCommand2, value: field2InFrench },
      ],
      language: "fr",
      modelId: (model as IModel)._id,
    };

    const res2 = await request(app)
      .put("/entities/")
      .set("Authorization", "Bearer " + adminToken)
      .send(commandInFrench);
    const result2: ResponseDto<EntityReadDto> = res2.body;

    expect(result2.success).toBeTruthy();
    expect(result2.data?.entityFieldValues.at(0)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand1.value
    );
    expect(result2.data?.entityFieldValues.at(0)?.value.at(1)?.text).toEqual(
      field1InFrench
    );
    expect(result2.data?.entityFieldValues.at(1)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand2.value
    );
    expect(result2.data?.entityFieldValues.at(1)?.value.at(1)?.text).toEqual(
      field2InFrench
    );

    expect(result2?.data?.assignedUsers.length).toEqual(2);
    expect(result2?.data?.assignedUsers.at(0)?.email).toEqual(
      assignedUser1?.email
    );
    expect(result2?.data?.assignedUsers.at(1)?.email).toEqual(
      assignedUser2?.email
    );
  });
});
