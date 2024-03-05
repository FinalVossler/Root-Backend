import request from "supertest";

import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import userService from "../../elements/user/ports/user.service";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import { adminUser } from "../fixtures";
import {
  FieldTypeEnum,
  IFieldCreateCommand,
  IFieldReadDto,
  IFieldTableElementReadDto,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";
import { IFieldTableElement } from "../../elements/fieldTableElement/fieldTableElement.model";
import { createMongooseFieldRepository } from "../../elements/field/adapters/field.mongoose.repository";
import { IField } from "../../elements/field/ports/interfaces/IField";

jest.setTimeout(50000);
const fieldRepository = createMongooseFieldRepository();

describe("fieldRouter", () => {
  const adminToken = userService.generateToken(adminUser);
  let createdField: IFieldReadDto | null;
  let fieldToUpdate: IField | null;
  let fieldToDelete: IField | null;
  let fieldToSearch: IField | null;
  let fieldToCopy: IField | null;

  beforeAll(async () => {
    fieldToUpdate = await fieldRepository.create({
      canChooseFromExistingFiles: false,
      fieldEvents: [],
      language: "en",
      name: "Field to update",
      type: FieldTypeEnum.Text,
      tableOptions: {
        columns: [],
        name: "",
        rows: [],
        yearTable: false,
      },
    });

    fieldToDelete = await fieldRepository.create({
      canChooseFromExistingFiles: false,
      fieldEvents: [],
      language: "en",
      name: "Field to delete",
      type: FieldTypeEnum.File,
      tableOptions: {
        columns: [],
        name: "",
        rows: [],
        yearTable: false,
      },
    });

    fieldToSearch = await fieldRepository.create({
      canChooseFromExistingFiles: false,
      fieldEvents: [],
      language: "en",
      name: "Field to search",
      type: FieldTypeEnum.Paragraph,
      tableOptions: {
        columns: [],
        name: "",
        rows: [],
        yearTable: false,
      },
    });

    fieldToCopy = await fieldRepository.create({
      canChooseFromExistingFiles: true,
      fieldEvents: [],
      language: "en",
      name: "Field to copy",
      type: FieldTypeEnum.Selector,
      options: [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ],
      tableOptions: {
        columns: [
          { language: "en", name: "Column1" },
          { language: "en", name: "Column2" },
        ],
        name: "tableName",
        rows: [
          { language: "en", name: "Row1" },
          { language: "en", name: "Row2" },
        ],
        yearTable: false,
      },
    });
  });

  afterAll(async () => {
    if (createdField?._id) {
      await fieldRepository.deleteFields([createdField?._id]);
    }
    if (fieldToUpdate?._id) {
      await fieldRepository.deleteFields([fieldToUpdate?._id.toString()]);
    }
    if (fieldToSearch?._id) {
      await fieldRepository.deleteFields([fieldToSearch?._id.toString()]);
    }
    if (fieldToCopy?._id) {
      await fieldRepository.deleteFields([fieldToCopy?._id.toString()]);
    }
  });

  it("should create a field", () => {
    const command: IFieldCreateCommand = {
      name: "Field 1",
      language: "en",
      type: FieldTypeEnum.Text,
      tableOptions: {
        name: "",
        columns: [],
        rows: [],
        yearTable: false,
      },
      canChooseFromExistingFiles: false,
      fieldEvents: [],
    };
    return request(app)
      .post("/fields/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IFieldReadDto> = res.body;

        createdField = result.data;
        expect(result.data?.name[0].text).toEqual(command.name);
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              canChooseFromExistingFiles: command.canChooseFromExistingFiles,
              type: command.type,
            }),
          })
        );
      });
  });

  it("should update a field", () => {
    const command: IFieldUpdateCommand = {
      _id: fieldToUpdate?._id.toString() || "",
      name: "Updated field name",
      type: FieldTypeEnum.Number,
      canChooseFromExistingFiles: true,
      language: "en",
      fieldEvents: [],
      tableOptions: {
        name: "",
        columns: [],
        rows: [],
        yearTable: false,
      },
    };
    return request(app)
      .put("/fields/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IFieldReadDto> = res.body;

        expect(result.data?.name[0].text).toEqual(command.name);
        expect(result.data?.type).toEqual(command.type);
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              canChooseFromExistingFiles: command.canChooseFromExistingFiles,
            }),
          })
        );
      });
  });

  it("should get fields", () => {
    const command: IFieldsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    return request(app)
      .post("/fields/getFields")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IFieldReadDto>> =
          res.body;

        expect(result.data?.total).toEqual(expect.any(Number));
        expect(Object.values(FieldTypeEnum)).toContain(
          result.data?.data[0].type
        );
        expect(result?.data?.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(Array),
            }),
          ])
        );
      });
  });

  it("should delete field", () => {
    return request(app)
      .delete("/fields")
      .send([fieldToDelete?._id.toString()])
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<void> = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
          })
        );
      });
  });

  it("should search for field", () => {
    const command: IFieldsSearchCommand = {
      name: fieldToSearch?.name[0].text || "",
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/fields/search")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IFieldReadDto>> =
          res.body;

        expect(result.data?.data[0].name[0].text).toEqual(
          fieldToSearch?.name[0].text
        );
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
          })
        );
      });
  });

  it("should copy field", () => {
    const command = { ids: [fieldToCopy?._id.toString()] };

    return request(app)
      .post("/fields/copy")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: IResponseDto<IFieldReadDto[]> = res.body;

        expect(result.data?.[0].name[0].text).toEqual(
          fieldToCopy?.name[0].text
        );
        expect(result.data?.[0].canChooseFromExistingFiles).toEqual(
          fieldToCopy?.canChooseFromExistingFiles
        );
        expect(result.data?.[0].type).toEqual(fieldToCopy?.type);
        expect(result.data?.[0].options?.[0].label[0].text).toEqual(
          fieldToCopy?.options?.[0].label[0].text
        );
        expect(result.data?.[0].options?.[0].value).toEqual(
          fieldToCopy?.options?.[0].value
        );

        expect(
          (
            result?.data?.[0].tableOptions
              ?.columns as IFieldTableElementReadDto[]
          )[0].name[0].text
        ).toEqual(
          (fieldToCopy?.tableOptions?.columns as IFieldTableElement[])[0]
            .name[0].text
        );
        expect(
          (
            result?.data?.[0].tableOptions?.rows as IFieldTableElementReadDto[]
          )[0].name[0].text
        ).toEqual(
          (fieldToCopy?.tableOptions?.rows as IFieldTableElement[])[0].name[0]
            .text
        );
        expect(result?.data?.[0].tableOptions?.name?.[0].text).toEqual(
          fieldToCopy?.tableOptions?.name?.[0].text
        );
        expect(result?.data?.[0].tableOptions?.yearTable).toEqual(
          fieldToCopy?.tableOptions?.yearTable
        );
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
          })
        );
      });
  });
});
