import request from "supertest";

import app from "../../server";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
} from "../fixtures";
import IResponseDto from "../../globalTypes/IResponseDto";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import {
  EventTriggerEnum,
  EventTypeEnum,
  IFieldReadDto,
  IModelCreateCommand,
  IModelReadDto,
  IModelStateReadDto,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
  ModelStateTypeEnum,
} from "roottypes";
import { IField } from "../../elements/field/ports/interfaces/IField";
import IModel from "../../elements/model/ports/interfaces/IModel";
import fieldMongooseRepository from "../../elements/field/adapters/field.mongoose.repository";
import { userService } from "../../ioc";
import modelMongooseRepository from "../../elements/model/adapters/model.mongoose.repository";

jest.setTimeout(50000);
describe("Models", () => {
  let createdModelId: string | undefined;
  let field1: IField | undefined;
  let field2: IField | undefined;
  let modelToUpdate: IModel | undefined;
  let modelToDelete: IModel | undefined;
  let modelToSearch: IModel | undefined;
  const adminToken = userService.generateToken(adminUser);
  const modelToSearchName = "model to search";

  beforeAll(async () => {
    field1 = await fieldMongooseRepository.create(
      createCreateFieldCommand("Field 1")
    );
    field2 = await fieldMongooseRepository.create(
      createCreateFieldCommand("Field 2")
    );

    modelToUpdate = await modelMongooseRepository.create(
      createCreateModelCommand("model to update", [field1])
    );
    modelToDelete = await modelMongooseRepository.create(
      createCreateModelCommand("model to delete", [field1])
    );
    modelToSearch = await modelMongooseRepository.create(
      createCreateModelCommand(modelToSearchName, [field1])
    );
  });

  afterAll(async () => {
    if (field1) {
      await fieldMongooseRepository.deleteFields([field1._id.toString()]);
    }
    if (field2) {
      await fieldMongooseRepository.deleteFields([field2._id.toString()]);
    }
    if (createdModelId) {
      await modelMongooseRepository.deleteModels([createdModelId]);
    }
    if (modelToUpdate) {
      await modelMongooseRepository.deleteModels([
        modelToUpdate._id.toString(),
      ]);
    }
    if (modelToDelete) {
      await modelMongooseRepository.deleteModels([
        modelToDelete._id.toString(),
      ]);
    }
    if (modelToSearch) {
      await modelMongooseRepository.deleteModels([
        modelToSearch._id.toString(),
      ]);
    }
  });

  it("should create a model", () => {
    const command: IModelCreateCommand = {
      language: "en",
      isForSale: false,
      modelEvents: [],
      modelFields: [
        {
          fieldId: field1?._id.toString() || "",
          mainField: true,
          stickInTable: false,
          required: false,
          modelStatesIds: [],
        },
      ],
      name: "created model name",
      states: [
        {
          exclusive: false,
          language: "en",
          name: "state 1",
          stateType: ModelStateTypeEnum.ParentState,
        },
      ],
      subStates: [
        {
          exclusive: false,
          language: "en",
          name: "sub state 1",
          stateType: ModelStateTypeEnum.SubState,
        },
      ],
    };
    return request(app)
      .post("/models/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IModelReadDto> = res.body;

        createdModelId = result.data?._id.toString();

        expect(result.success).toBeTruthy();
        expect(result.data?.name[0].text).toEqual(command.name);
        expect(
          (
            result.data?.modelFields.at(0)?.field as IFieldReadDto
          )._id.toString()
        ).toEqual(field1?._id.toString());
        expect(result.data?.modelFields.length).toEqual(1);
        expect(
          (result.data?.states as IModelStateReadDto[])?.at(0)?.name.at(0)?.text
        ).toEqual(command.states.at(0)?.name);
        expect(
          (result.data?.subStates as IModelStateReadDto[])?.at(0)?.name.at(0)
            ?.text
        ).toEqual(command.subStates.at(0)?.name);
        expect(result.data?.modelEvents?.length).toEqual(0);
      });
  });

  it("should update a model", () => {
    const command: IModelUpdateCommand = {
      _id: modelToUpdate?._id.toString() || "",
      language: "en",
      isForSale: false,
      modelEvents: [
        {
          eventTrigger: EventTriggerEnum.OnCreate,
          eventType: EventTypeEnum.Redirection,
          redirectionToSelf: true,
          redirectionUrl: "",
          requestData: "",
          requestDataIsCreatedEntity: false,
          requestHeaders: [],
          requestMethod: "GET",
          requestUrl: "",
        },
      ],
      modelFields: [
        {
          fieldId: field1?._id.toString() || "",
          mainField: true,
          stickInTable: false,
          required: false,
          modelStatesIds: [],
        },
        {
          fieldId: field2?._id.toString() || "",
          mainField: true,
          stickInTable: false,
          required: false,
          modelStatesIds: [],
        },
      ],
      name: "model to update with a new model name",
      states: [
        {
          exclusive: false,
          language: "en",
          name: "state 1 updated",
          stateType: ModelStateTypeEnum.ParentState,
        },
        {
          exclusive: false,
          language: "en",
          name: "state 2 updated",
          stateType: ModelStateTypeEnum.ParentState,
        },
      ],
      subStates: [
        {
          exclusive: false,
          language: "en",
          name: "sub state 2 updated",
          stateType: ModelStateTypeEnum.SubState,
        },
      ],
    };
    return request(app)
      .put("/models/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IModelReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.name[0].text).toEqual(command.name);
        expect(result.data?.modelFields?.length).toEqual(
          command.modelFields.length
        );
        expect(
          (
            result.data?.modelFields.at(0)?.field as IFieldReadDto
          )._id.toString()
        ).toEqual(command.modelFields.at(0)?.fieldId);
        expect((result.data?.states as IModelStateReadDto[])?.length).toEqual(
          command.states.length
        );
        expect(
          (result.data?.states as IModelStateReadDto[])?.at(0)?.name.at(0)?.text
        ).toEqual(command.states.at(0)?.name);
        expect(
          (result.data?.subStates as IModelStateReadDto[])?.length
        ).toEqual(command.subStates.length);
        expect(
          (result.data?.subStates as IModelStateReadDto[])?.at(0)?.name.at(0)
            ?.text
        ).toEqual(command.subStates.at(0)?.name);
        expect(result.data?.modelEvents?.length).toEqual(
          command.modelEvents.length
        );
      });
  });

  it("should get models", () => {
    const command: IModelsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/models/getModels")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IModelReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(expect.any(Number));
        expect(result.data?.data.length).not.toEqual(0);
        expect(result.data?.data.at(0)?.name.at(0)?.text).toEqual(
          expect.any(String)
        );
        expect(result.data?.data.at(0)?.states?.length).toEqual(
          expect.any(Number)
        );
        expect(result.data?.data.at(0)?.modelFields?.length).toEqual(
          expect.any(Number)
        );
        expect(result.data?.data.at(0)?.modelEvents?.length).toEqual(
          expect.any(Number)
        );
      });
  });

  it("should delete model", () => {
    return request(app)
      .delete("/models")
      .send([modelToDelete?._id])
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<void> = res.body;

        expect(result.success).toBeTruthy();
      });
  });

  it("should search a model", () => {
    const command: IModelsSearchCommand = {
      name: modelToSearchName,
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    return request(app)
      .post("/models/search")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IModelReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(expect.any(Number));
        expect(result.data?.data.length).not.toEqual(0);
        expect(result.data?.data.at(0)?.name.at(0)?.text).toEqual(
          modelToSearchName
        );
      });
  });
});
