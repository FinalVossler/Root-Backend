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
import EntitiesGetCommand from "../elements/entity/dto/EntitiesGetCommand";
import PaginationResponse from "../globalTypes/PaginationResponse";
import EntitiesSearchCommand from "../elements/entity/dto/EntitiesSearchCommand";
import EntitiesSetCustomDataKeyValueCommand from "../elements/entity/dto/EntitiesSetCustomDataKeyValueCommand";

jest.setTimeout(50000);
describe("entity router", () => {
  const adminToken: string = userService.generateToken(adminUser);

  let field1: IField | undefined;
  let field2: IField | undefined;
  let model: IModel | undefined;

  let model2ToWhichEntitiesbyModelDontBelong: IModel | undefined;
  let model3ToWhichUserIsAlsoAssigned: IModel | undefined;

  let entityToGetByIdAndToUseForModel1: IEntity | undefined;
  let entityThatBelongsToModel2: IEntity | undefined;
  let model1AssignedEntity: IEntity | undefined;
  let model1UnassignedEntity: IEntity | undefined;
  let model3AssignedEntity: IEntity | undefined;
  let createdEntity: EntityReadDto | null;
  let entityToUpdate: IEntity | null;
  let entityToDelete: IEntity | undefined;
  let entityToFindInSearch: IEntity | undefined;
  let entityToNotFindInSearch: IEntity | undefined;

  let assignedUser1: IUser | undefined;
  let assignedUser2: IUser | undefined;

  let searchByText: string = "Found";

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
    model2ToWhichEntitiesbyModelDontBelong = await modelRepository.create(
      createCreateModelCommand("Entity test model 2", [field1, field2])
    );
    model3ToWhichUserIsAlsoAssigned = await modelRepository.create(
      createCreateModelCommand("Entity test model 3", [field1, field2])
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
    entityToGetByIdAndToUseForModel1 = await entityRepository.create(
      createEntityCommand
    );
    entityToUpdate = await entityRepository.create(createEntityCommand);
    entityThatBelongsToModel2 = await entityRepository.create({
      ...createEntityCommand,
      modelId: model2ToWhichEntitiesbyModelDontBelong._id,
    });

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

    model1AssignedEntity = await entityRepository.create({
      ...createEntityCommand,
      assignedUsersIds: [assignedUser1._id.toString()],
    });
    model1UnassignedEntity = await entityRepository.create(createEntityCommand);
    model3AssignedEntity = await entityRepository.create({
      ...createEntityCommand,
      assignedUsersIds: [assignedUser1._id.toString()],
      modelId: model3ToWhichUserIsAlsoAssigned._id,
    });
    entityToDelete = await entityRepository.create(createEntityCommand);
    entityToFindInSearch = await entityRepository.create({
      ...createEntityCommand,
      entityFieldValues: [
        { ...entityField1ValueCommand1, value: searchByText },
        { ...entityField1ValueCommand2, value: "Whatever" },
      ],
    });
    entityToNotFindInSearch = await entityRepository.create({
      ...createEntityCommand,
      entityFieldValues: [
        { ...entityField1ValueCommand1, value: "Nope" },
        { ...entityField1ValueCommand2, value: "Nope" },
      ],
    });
  });

  afterAll(async () => {
    const promises: Promise<any>[] = [];
    if (entityToGetByIdAndToUseForModel1) {
      promises.push(
        entityRepository.deleteEntities([entityToGetByIdAndToUseForModel1._id])
      );
    }
    if (model) {
      promises.push(modelRepository.deleteModels([model._id]));
    }
    if (model2ToWhichEntitiesbyModelDontBelong) {
      promises.push(
        modelRepository.deleteModels([
          model2ToWhichEntitiesbyModelDontBelong._id,
        ])
      );
    }
    if (model3ToWhichUserIsAlsoAssigned) {
      promises.push(
        modelRepository.deleteModels([model3ToWhichUserIsAlsoAssigned._id])
      );
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
    if (entityThatBelongsToModel2) {
      promises.push(
        entityRepository.deleteEntities([entityThatBelongsToModel2._id])
      );
    }
    if (model1AssignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model1AssignedEntity._id])
      );
    }
    if (model1UnassignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model1UnassignedEntity._id])
      );
    }
    if (model3AssignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model3AssignedEntity._id])
      );
    }
    if (entityToDelete) {
      promises.push(entityRepository.deleteEntities([entityToDelete._id]));
    }
    if (entityToFindInSearch) {
      promises.push(
        entityRepository.deleteEntities([entityToFindInSearch._id])
      );
    }
    if (entityToNotFindInSearch) {
      promises.push(
        entityRepository.deleteEntities([entityToNotFindInSearch._id])
      );
    }

    await Promise.all(promises);
  });

  it("should get by id", () => {
    return request(app)
      .get("/entities/getEntity")
      .query({ entityId: entityToGetByIdAndToUseForModel1?._id.toString() })
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: ResponseDto<EntityReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?._id.toString()).toEqual(
          entityToGetByIdAndToUseForModel1?._id.toString()
        );
        expect(result.data?.entityFieldValues.length).toEqual(
          entityToGetByIdAndToUseForModel1?.entityFieldValues.length
        );
        expect(result.data?.entityFieldValues[0].value.at(0)?.text).toEqual(
          entityToGetByIdAndToUseForModel1?.entityFieldValues[0].value.at(0)
            ?.text
        );
        expect(result.data?.entityFieldValues[1].value.at(0)?.text).toEqual(
          entityToGetByIdAndToUseForModel1?.entityFieldValues[1].value.at(0)
            ?.text
        );
        expect(result.data?.model._id.toString()).toEqual(
          entityToGetByIdAndToUseForModel1?.model._id.toString()
        );
      });
  });

  it("should create entity", () => {
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

  it("should get entities by model", async () => {
    const model1EntitiesCommand: EntitiesGetCommand = {
      modelId: (model as IModel)?._id,
      paginationCommand: {
        limit: 50,
        page: 1,
      },
    };
    const res = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(model1EntitiesCommand)
      .set("Authorization", "Bearer " + adminToken);
    const result: ResponseDto<PaginationResponse<EntityReadDto>> = res.body;

    expect(result.success).toBeTruthy();

    let foundModel1Entity: boolean = Boolean(
      result.data?.data.some(
        (el) =>
          el._id.toString() === entityToGetByIdAndToUseForModel1?._id.toString()
      )
    );
    let foundModel2Entity: boolean = Boolean(
      result.data?.data.some(
        (el) => el._id.toString() === entityThatBelongsToModel2?._id.toString()
      )
    );
    expect(foundModel1Entity).toEqual(true);
    expect(foundModel2Entity).toEqual(false);

    const model2EntitiesCommand: EntitiesGetCommand = {
      modelId: (model2ToWhichEntitiesbyModelDontBelong as IModel)?._id,
      paginationCommand: {
        limit: 50,
        page: 1,
      },
    };
    const res2 = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(model2EntitiesCommand)
      .set("Authorization", "Bearer " + adminToken);
    const result2: ResponseDto<PaginationResponse<EntityReadDto>> = res2.body;

    expect(result2.success).toBeTruthy();

    foundModel1Entity = Boolean(
      result2.data?.data.some(
        (el) =>
          el._id.toString() === entityToGetByIdAndToUseForModel1?._id.toString()
      )
    );
    foundModel2Entity = Boolean(
      result2.data?.data.some(
        (el) => el._id.toString() === entityThatBelongsToModel2?._id.toString()
      )
    );
    expect(foundModel1Entity).toEqual(false);
    expect(foundModel2Entity).toEqual(true);
  });

  it("should get assigned entities by model", () => {
    const command: EntitiesGetCommand = {
      modelId: (model as IModel)._id,
      paginationCommand: {
        limit: 30,
        page: 1,
      },
    };
    return request(app)
      .post("/entities/getAssignedEntitiesByModel")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<EntityReadDto>> = res.body;

        expect(result.success).toBeTruthy();

        const foundTheAssignedEntity: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === model1AssignedEntity?._id.toString()
          )
        );
        const foundTheUnassignedEntity: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === model1UnassignedEntity?._id.toString()
          )
        );

        expect(foundTheAssignedEntity).toBeTruthy();
        expect(foundTheUnassignedEntity).toEqual(false);
      });
  });

  it("should make sure the number of assigned entities by model is correct", () => {
    const command: EntitiesGetCommand = {
      modelId: (model3ToWhichUserIsAlsoAssigned as IModel)._id,
      paginationCommand: {
        limit: 30,
        page: 1,
      },
    };
    return request(app)
      .post("/entities/getAssignedEntitiesByModel")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<EntityReadDto>> = res.body;

        expect(result.success).toBeTruthy();

        expect(result.data?.data.at(0)?._id.toString()).toEqual(
          model3AssignedEntity?._id.toString()
        );
        expect(result.data?.data.length).toEqual(1);
      });
  });

  it("should delete an entity", async () => {
    const getModel1EntitiesCommand: EntitiesGetCommand = {
      modelId: (model as IModel)?._id,
      paginationCommand: {
        limit: 50,
        page: 1,
      },
    };

    const res1 = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(getModel1EntitiesCommand)
      .expect(200)
      .set("Authorization", "Bearer " + adminToken);
    const result1: ResponseDto<PaginationResponse<EntityReadDto>> = res1.body;

    let foundDeletedEntity: boolean = Boolean(
      result1.data?.data.some(
        (el) => el._id.toString() === entityToDelete?._id.toString()
      )
    );

    expect(foundDeletedEntity).toBeTruthy();

    const res2 = await request(app)
      .delete("/entities")
      .send([entityToDelete?._id])
      .set("Authorization", "Bearer " + adminToken);
    const result2: ResponseDto<void> = res2.body;

    expect(result2.success).toBeTruthy();

    const res3 = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(getModel1EntitiesCommand)
      .set("Authorization", "Bearer " + adminToken);
    const result3: ResponseDto<PaginationResponse<EntityReadDto>> = res3.body;

    expect(result3.success).toBeTruthy();

    foundDeletedEntity = Boolean(
      result3.data?.data.some(
        (el) => el._id.toString() === entityToDelete?._id.toString()
      )
    );

    expect(foundDeletedEntity).toEqual(false);
  });

  it("should search for an entity", () => {
    const command: EntitiesSearchCommand = {
      modelId: (model as IModel)._id.toString(),
      name: searchByText,
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    return request(app)
      .post("/entities/search")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<EntityReadDto>> = res.body;

        expect(result.success).toBeTruthy();
        const isEntityThatShouldBeFoundFound: boolean = Boolean(
          result.data?.data.some(
            (el) => el._id.toString() === entityToFindInSearch?._id.toString()
          )
        );
        const isEntityThatShouldntBeFoundFound: boolean = Boolean(
          result.data?.data.some(
            (el) =>
              el._id.toString() === entityToNotFindInSearch?._id.toString()
          )
        );

        expect(isEntityThatShouldBeFoundFound).toBeTruthy();
        expect(isEntityThatShouldntBeFoundFound).toEqual(false);
      });
  });

  it("should set custom data key value", async () => {
    const command: EntitiesSetCustomDataKeyValueCommand = {
      entityId: (entityToGetByIdAndToUseForModel1 as IEntity)?._id,
      key: "testKey",
      value: JSON.stringify({
        a: "this is the value of a",
        b: "this is the value of b",
      }),
    };

    await request(app)
      .post("/entities/setCustomDataKeyValue")
      .send(command)
      .expect(200)
      .set("Authorization", "Bearer " + adminToken);

    return request(app)
      .get("/entities/getEntity")
      .query({
        entityId: (entityToGetByIdAndToUseForModel1 as IEntity)._id.toString(),
      })
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: ResponseDto<EntityReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.customData).toBeDefined();
        expect(result.data?.customData).toEqual(
          JSON.stringify({ [command.key]: command.value })
        );
      });
  });
});
