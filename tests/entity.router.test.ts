import request from "supertest";
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
import ResponseDto from "../globalTypes/ResponseDto";
import userService from "../elements/user/user.service";
import { IUser } from "../elements/user/user.model";
import userRepository from "../elements/user/user.repository";
import PaginationResponse from "../globalTypes/PaginationResponse";
import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityReadDto,
  IEntityUpdateCommand,
  IModelReadDto,
  IUserCreateCommand,
  IUserReadDto,
  SuperRoleEnum,
} from "roottypes";

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
  let createdEntity: IEntityReadDto | null;
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
    entityToGetByIdAndToUseForModel1 = await entityRepository.create(
      createEntityCommand
    );
    entityToUpdate = await entityRepository.create(createEntityCommand);
    entityThatBelongsToModel2 = await entityRepository.create({
      ...createEntityCommand,
      modelId: model2ToWhichEntitiesbyModelDontBelong._id.toString(),
    });

    const assignedUser1CreateCommand: IUserCreateCommand = {
      email: "assignedUser1@updating.com",
      firstName: "assignedUser1FirstName",
      lastName: "assignedUser1LastName",
      password: "assignedUser1Password",
      superRole: SuperRoleEnum.Normal,
    };
    assignedUser1 = await userRepository.create(assignedUser1CreateCommand);

    const assignedUser2CreateCommand: IUserCreateCommand = {
      email: "assignedUser2@updating.com",
      firstName: "assignedUser2FirstName",
      lastName: "assignedUser2LastName",
      password: "assignedUser2Password",
      superRole: SuperRoleEnum.Normal,
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
      modelId: model3ToWhichUserIsAlsoAssigned._id.toString(),
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
        entityRepository.deleteEntities([
          entityToGetByIdAndToUseForModel1._id.toString(),
        ])
      );
    }
    if (model) {
      promises.push(modelRepository.deleteModels([model._id.toString()]));
    }
    if (model2ToWhichEntitiesbyModelDontBelong) {
      promises.push(
        modelRepository.deleteModels([
          model2ToWhichEntitiesbyModelDontBelong._id.toString(),
        ])
      );
    }
    if (model3ToWhichUserIsAlsoAssigned) {
      promises.push(
        modelRepository.deleteModels([
          model3ToWhichUserIsAlsoAssigned._id.toString(),
        ])
      );
    }
    if (field1) {
      promises.push(fieldRepository.deleteFields([field1._id.toString()]));
    }
    if (field2) {
      promises.push(fieldRepository.deleteFields([field2._id.toString()]));
    }
    if (createdEntity) {
      promises.push(
        entityRepository.deleteEntities([createdEntity._id.toString()])
      );
    }
    if (entityToUpdate) {
      promises.push(
        entityRepository.deleteEntities([entityToUpdate._id.toString()])
      );
    }
    if (assignedUser1) {
      promises.push(userRepository.deleteByEmail(assignedUser1.email));
    }
    if (assignedUser2) {
      promises.push(userRepository.deleteByEmail(assignedUser2.email));
    }
    if (entityThatBelongsToModel2) {
      promises.push(
        entityRepository.deleteEntities([
          entityThatBelongsToModel2._id.toString(),
        ])
      );
    }
    if (model1AssignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model1AssignedEntity._id.toString()])
      );
    }
    if (model1UnassignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model1UnassignedEntity._id.toString()])
      );
    }
    if (model3AssignedEntity) {
      promises.push(
        entityRepository.deleteEntities([model3AssignedEntity._id.toString()])
      );
    }
    if (entityToDelete) {
      promises.push(
        entityRepository.deleteEntities([entityToDelete._id.toString()])
      );
    }
    if (entityToFindInSearch) {
      promises.push(
        entityRepository.deleteEntities([entityToFindInSearch._id.toString()])
      );
    }
    if (entityToNotFindInSearch) {
      promises.push(
        entityRepository.deleteEntities([
          entityToNotFindInSearch._id.toString(),
        ])
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
        const result: ResponseDto<IEntityReadDto> = res.body;

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
        expect((result.data?.model as IModelReadDto)._id.toString()).toEqual(
          entityToGetByIdAndToUseForModel1?.model._id.toString()
        );
      });
  });

  it("should create entity", () => {
    const entityField1ValueCommand1: IEntityFieldValueCommand = {
      fieldId: (field1 as IField)._id.toString(),
      files: [],
      tableValues: [],
      value: "Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: IEntityFieldValueCommand = {
      fieldId: (field2 as IField)._id.toString(),
      files: [],
      tableValues: [],
      value: "Value 2",
      yearTableValues: [],
    };
    const createEntityCommand: IEntityCreateCommand = {
      assignedUsersIds: [],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: (model as IModel)._id.toString(),
    };
    return request(app)
      .post("/entities/")
      .send(createEntityCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<IEntityReadDto> = res.body;

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
        expect((result.data?.model as IModelReadDto)._id.toString()).toEqual(
          model?._id.toString()
        );
      });
  });

  it("should update an entity", async () => {
    const entityField1ValueCommand1: IEntityFieldValueCommand = {
      fieldId: (field1 as IField)._id.toString(),
      files: [],
      tableValues: [],
      value: "updated Value 1",
      yearTableValues: [],
    };
    const entityField1ValueCommand2: IEntityFieldValueCommand = {
      fieldId: (field2 as IField)._id.toString(),
      files: [],
      tableValues: [],
      value: "updated Value 2",
      yearTableValues: [],
    };

    const command: IEntityUpdateCommand = {
      _id: entityToUpdate?._id.toString() || "",
      assignedUsersIds: [(assignedUser1 as IUser)._id.toString()],
      entityFieldValues: [entityField1ValueCommand1, entityField1ValueCommand2],
      language: "en",
      modelId: (model as IModel)._id.toString(),
    };

    const res = await request(app)
      .put("/entities/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command);
    const result: ResponseDto<IEntityReadDto> = res.body;

    expect(result.success).toBeTruthy();
    expect(result.data?.entityFieldValues.at(0)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand1.value
    );
    expect(result.data?.entityFieldValues.at(1)?.value.at(0)?.text).toEqual(
      entityField1ValueCommand2.value
    );
    expect(result?.data?.assignedUsers.length).toEqual(1);
    expect(
      (result?.data?.assignedUsers as IUserReadDto[]).at(0)?.email
    ).toEqual(assignedUser1?.email);

    // Update in a different language:

    const field1InFrench = "Valeur en Français de field1";
    const field2InFrench = "Valeur en Français de field2";
    const commandInFrench: IEntityUpdateCommand = {
      _id: entityToUpdate?._id.toString() || "",
      assignedUsersIds: [
        (assignedUser1 as IUser)._id.toString(),
        (assignedUser2 as IUser)._id.toString(),
      ],
      entityFieldValues: [
        { ...entityField1ValueCommand1, value: field1InFrench },
        { ...entityField1ValueCommand2, value: field2InFrench },
      ],
      language: "fr",
      modelId: (model as IModel)._id.toString(),
    };

    const res2 = await request(app)
      .put("/entities/")
      .set("Authorization", "Bearer " + adminToken)
      .send(commandInFrench);
    const result2: ResponseDto<IEntityReadDto> = res2.body;

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
    expect(
      (result2?.data?.assignedUsers as IUserReadDto[]).at(0)?.email
    ).toEqual(assignedUser1?.email);
    expect(
      (result2?.data?.assignedUsers as IUserReadDto[]).at(1)?.email
    ).toEqual(assignedUser2?.email);
  });

  it("should get entities by model", async () => {
    const model1EntitiesCommand: IEntitiesGetCommand = {
      modelId: (model as IModel)?._id.toString(),
      paginationCommand: {
        limit: 50,
        page: 1,
      },
    };
    const res = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(model1EntitiesCommand)
      .set("Authorization", "Bearer " + adminToken);
    const result: ResponseDto<PaginationResponse<IEntityReadDto>> = res.body;

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

    const model2EntitiesCommand: IEntitiesGetCommand = {
      modelId: (
        model2ToWhichEntitiesbyModelDontBelong as IModel
      )?._id.toString(),
      paginationCommand: {
        limit: 50,
        page: 1,
      },
    };
    const res2 = await request(app)
      .post("/entities/getEntitiesByModel")
      .send(model2EntitiesCommand)
      .set("Authorization", "Bearer " + adminToken);
    const result2: ResponseDto<PaginationResponse<IEntityReadDto>> = res2.body;

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
    const command: IEntitiesGetCommand = {
      modelId: (model as IModel)._id.toString(),
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
        const result: ResponseDto<PaginationResponse<IEntityReadDto>> =
          res.body;

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
    const command: IEntitiesGetCommand = {
      modelId: (model3ToWhichUserIsAlsoAssigned as IModel)._id.toString(),
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
        const result: ResponseDto<PaginationResponse<IEntityReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();

        expect(result.data?.data.at(0)?._id.toString()).toEqual(
          model3AssignedEntity?._id.toString()
        );
        expect(result.data?.data.length).toEqual(1);
      });
  });

  it("should delete an entity", async () => {
    const getModel1EntitiesCommand: IEntitiesGetCommand = {
      modelId: (model as IModel)?._id.toString(),
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
    const result1: ResponseDto<PaginationResponse<IEntityReadDto>> = res1.body;

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
    const result3: ResponseDto<PaginationResponse<IEntityReadDto>> = res3.body;

    expect(result3.success).toBeTruthy();

    foundDeletedEntity = Boolean(
      result3.data?.data.some(
        (el) => el._id.toString() === entityToDelete?._id.toString()
      )
    );

    expect(foundDeletedEntity).toEqual(false);
  });

  it("should search for an entity", () => {
    const command: IEntitiesSearchCommand = {
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
        const result: ResponseDto<PaginationResponse<IEntityReadDto>> =
          res.body;

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
    const command: IEntitiesSetCustomDataKeyValueCommand = {
      entityId: (entityToGetByIdAndToUseForModel1 as IEntity)?._id.toString(),
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
        const result: ResponseDto<IEntityReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.customData).toBeDefined();
        expect(result.data?.customData).toEqual(
          JSON.stringify({ [command.key]: command.value })
        );
      });
  });
});
