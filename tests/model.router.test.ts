import request from "supertest";
import mongoose from "mongoose";

import app from "../server";
import ModelCreateCommand from "../elements/model/dto/ModelCreateCommand";
import fieldRepository from "../elements/field/field.repository";
import { IField } from "../elements/field/field.model";
import modelRepository from "../elements/model/model.repository";
import userService from "../elements/user/user.service";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
} from "./fixtures";
import ModelReadDto from "../elements/model/dto/ModelReadDto";
import ResponseDto from "../globalTypes/ResponseDto";
import { ModelStateType } from "../elements/modelState/modelState.model";
import ModelUpdateCommand from "../elements/model/dto/ModelUpdateCommand";
import { IModel } from "../elements/model/model.model";
import { EventTriggerEnum, EventTypeEnum } from "../elements/event/event.model";
import ModelsGetCommand from "../elements/model/dto/ModelsGetCommand";
import PaginationResponse from "../globalTypes/PaginationResponse";
import ModelsSearchCommand from "../elements/model/dto/ModelsSearchCommand";

describe.skip("model router", () => {
  let createdModelId: mongoose.Types.ObjectId | undefined;
  let field1: IField | undefined;
  let field2: IField | undefined;
  let modelToUpdate: IModel | undefined;
  let modelToDelete: IModel | undefined;
  let modelToSearch: IModel | undefined;
  const adminToken = userService.generateToken(adminUser);
  const modelToSearchName = "model to search";

  beforeAll(async () => {
    field1 = await fieldRepository.create(createCreateFieldCommand("Field 1"));
    field2 = await fieldRepository.create(createCreateFieldCommand("Field 2"));

    modelToUpdate = await modelRepository.create(
      createCreateModelCommand("model to update", [field1])
    );
    modelToDelete = await modelRepository.create(
      createCreateModelCommand("model to delete", [field1])
    );
    modelToSearch = await modelRepository.create(
      createCreateModelCommand(modelToSearchName, [field1])
    );
  });

  afterAll(async () => {
    if (field1) {
      await fieldRepository.deleteFields([field1._id]);
    }
    if (field2) {
      await fieldRepository.deleteFields([field2._id]);
    }
    if (createdModelId) {
      await modelRepository.deleteModels([createdModelId]);
    }
    if (modelToUpdate) {
      await modelRepository.deleteModels([modelToUpdate._id]);
    }
    if (modelToDelete) {
      await modelRepository.deleteModels([modelToDelete._id]);
    }
    if (modelToSearch) {
      await modelRepository.deleteModels([modelToSearch._id]);
    }
  });

  it("should create a model", () => {
    const command: ModelCreateCommand = {
      language: "en",
      modelEvents: [],
      modelFields: [
        {
          fieldId: field1?._id.toString() || "",
          mainField: true,
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
          stateType: ModelStateType.ParentState,
        },
      ],
      subStates: [
        {
          exclusive: false,
          language: "en",
          name: "sub state 1",
          stateType: ModelStateType.SubState,
        },
      ],
    };
    return request(app)
      .post("/models/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<ModelReadDto> = res.body;

        createdModelId = result.data?._id;

        expect(result.success).toBeTruthy();
        expect(result.data?.name[0].text).toEqual(command.name);
        expect(result.data?.modelFields.at(0)?.field._id.toString()).toEqual(
          field1?._id.toString()
        );
        expect(result.data?.modelFields.length).toEqual(1);
        expect(result.data?.states?.at(0)?.name.at(0)?.text).toEqual(
          command.states.at(0)?.name
        );
        expect(result.data?.subStates?.at(0)?.name.at(0)?.text).toEqual(
          command.subStates.at(0)?.name
        );
        expect(result.data?.modelEvents?.length).toEqual(0);
      });
  });

  it("should update a model", () => {
    const command: ModelUpdateCommand = {
      _id: modelToUpdate?._id.toString() || "",
      language: "en",
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
          required: false,
          modelStatesIds: [],
        },
        {
          fieldId: field2?._id.toString() || "",
          mainField: true,
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
          stateType: ModelStateType.ParentState,
        },
        {
          exclusive: false,
          language: "en",
          name: "state 2 updated",
          stateType: ModelStateType.ParentState,
        },
      ],
      subStates: [
        {
          exclusive: false,
          language: "en",
          name: "sub state 2 updated",
          stateType: ModelStateType.SubState,
        },
      ],
    };
    return request(app)
      .put("/models/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<ModelReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.name[0].text).toEqual(command.name);
        expect(result.data?.modelFields?.length).toEqual(
          command.modelFields.length
        );
        expect(result.data?.modelFields.at(0)?.field._id.toString()).toEqual(
          command.modelFields.at(0)?.fieldId
        );
        expect(result.data?.states?.length).toEqual(command.states.length);
        expect(result.data?.states?.at(0)?.name.at(0)?.text).toEqual(
          command.states.at(0)?.name
        );
        expect(result.data?.subStates?.length).toEqual(
          command.subStates.length
        );
        expect(result.data?.subStates?.at(0)?.name.at(0)?.text).toEqual(
          command.subStates.at(0)?.name
        );
        expect(result.data?.modelEvents?.length).toEqual(
          command.modelEvents.length
        );
      });
  });

  it("should get models", () => {
    const command: ModelsGetCommand = {
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
        const result: ResponseDto<PaginationResponse<ModelReadDto>> = res.body;

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
        const result: ResponseDto<void> = res.body;

        expect(result.success).toBeTruthy();
      });
  });

  it("should search a model", () => {
    const command: ModelsSearchCommand = {
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
        const result: ResponseDto<PaginationResponse<ModelReadDto>> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(expect.any(Number));
        expect(result.data?.data.length).not.toEqual(0);
        expect(result.data?.data.at(0)?.name.at(0)?.text).toEqual(
          modelToSearchName
        );
      });
  });
});
