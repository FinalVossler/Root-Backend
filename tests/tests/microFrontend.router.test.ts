import request from "supertest";
import app from "../../server";
import {
  IMicroFrontendCreateCommand,
  IMicroFrontendReadDto,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";
import IResponseDto from "../../globalTypes/IResponseDto";
import { adminUser } from "../fixtures";
import microFrontendMongooseRepository from "../../elements/microFontend/adapters/microFrontend.mongoose.respository";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import { userService } from "../../ioc";
import IMicroFrontend from "../../elements/microFontend/ports/interfaces/IMicroFrontend";

jest.setTimeout(50000);
describe("MicroFrontends", () => {
  const adminToken: string = userService.generateToken(adminUser);
  let createdMicroFrontend: IMicroFrontendReadDto | undefined;
  let microFrontendToUpdate: IMicroFrontend | undefined;
  let microFrontendToGet: IMicroFrontend | undefined;
  let microFrontendToDelete: IMicroFrontend | undefined;
  let microFrontendToFindInSearch: IMicroFrontend | undefined;
  let microFrontendToNotFindInSearch: IMicroFrontend | undefined;

  beforeAll(async () => {
    const command: IMicroFrontendCreateCommand = {
      components: [
        {
          name: "Component1OfMicroFrontendToUpdate",
        },
        {
          name: "Component2OfMicroFrontendToUpdate",
        },
      ],
      name: "MicroFrontend to update",
      remoteEntry: "http://localhost:3000/remoteEntry.js",
    };

    microFrontendToUpdate = await microFrontendMongooseRepository.create(
      command
    );
    microFrontendToGet = await microFrontendMongooseRepository.create({
      ...command,
      name: command.name.replace("to update", "to get"),
      components: command.components.map((c) => ({
        name: c.name.replace("ToUpdate", "ToGet"),
      })),
    });
    microFrontendToDelete = await microFrontendMongooseRepository.create({
      ...command,
      name: command.name.replace("to update", "to delete"),
      components: command.components.map((c) => ({
        name: c.name.replace("ToUpdate", "ToDelete"),
      })),
    });
    microFrontendToFindInSearch = await microFrontendMongooseRepository.create({
      ...command,
      name: "Search result",
      components: command.components.map((c) => ({
        name: c.name.replace("ToUpdate", "ToSearch"),
      })),
    });
    microFrontendToNotFindInSearch =
      await microFrontendMongooseRepository.create({
        ...command,
        name: "dont find me",
        components: command.components.map((c) => ({
          name: c.name.replace("ToUpdate", "ToNotFindInSearch"),
        })),
      });
  });

  afterAll(async () => {
    const promises: Promise<void>[] = [];

    if (microFrontendToUpdate) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          microFrontendToUpdate._id,
        ])
      );
    }
    if (createdMicroFrontend) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          createdMicroFrontend._id,
        ])
      );
    }
    if (microFrontendToGet) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          microFrontendToGet._id,
        ])
      );
    }
    if (microFrontendToDelete) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          microFrontendToDelete._id,
        ])
      );
    }
    if (microFrontendToFindInSearch) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          microFrontendToFindInSearch._id,
        ])
      );
    }
    if (microFrontendToNotFindInSearch) {
      promises.push(
        microFrontendMongooseRepository.deleteMicroFrontends([
          microFrontendToNotFindInSearch._id,
        ])
      );
    }

    await Promise.all(promises);
  });

  it("should create a microFrontend", () => {
    const command: IMicroFrontendCreateCommand = {
      components: [
        {
          name: "Component1",
        },
        {
          name: "Component2",
        },
      ],
      name: "MicroFrontend for test",
      remoteEntry: "http://localhost:3000/remoteEntry.js",
    };

    return request(app)
      .post("/microFrontends/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IMicroFrontendReadDto> = res.body;

        createdMicroFrontend = result.data as IMicroFrontendReadDto;

        expect(result.success).toBeTruthy();
        expect(result.data?.components.length).toEqual(2);
        expect(result.data?.name).toEqual(command.name);
        expect(result.data?.remoteEntry).toEqual(command.remoteEntry);
      });
  });

  it("should update a microFrontend", () => {
    const command: IMicroFrontendUpdateCommand = {
      _id: (microFrontendToUpdate as IMicroFrontendReadDto)?._id,
      components: [
        {
          name: "UpdatedComponentName1",
        },
        {
          name: "UpdatedComponentName2",
        },
        {
          name: "UpdatedComponentName3",
        },
      ],
      name: "MicroFrontend for test",
      remoteEntry: "http://updatedLocalhost:3000/remoteEntry.js",
    };

    return request(app)
      .put("/microFrontends/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IMicroFrontendReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.components.length).toEqual(
          command.components.length
        );
        expect(result.data?.name).toEqual(command.name);
        expect(result.data?.remoteEntry).toEqual(command.remoteEntry);
      });
  });

  it("should get MicroFrontends", () => {
    const command: IMicroFrontendsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/microFrontends/getMicroFrontends/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IMicroFrontendReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();

        expect(result.data?.data.length).toBeGreaterThan(0);
      });
  });

  it("should get by id", () => {
    return request(app)
      .get("/microFrontends/getById/")
      .set("Authorization", "Bearer " + adminToken)
      .query({ microFrontendId: microFrontendToGet?._id.toString() })
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IMicroFrontendReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.components.length).toEqual(
          microFrontendToGet?.components.length
        );
        expect(result.data?.name).toEqual(microFrontendToGet?.name);
        expect(result.data?.remoteEntry).toEqual(
          microFrontendToGet?.remoteEntry
        );
      });
  });

  it("should delete a microFrontend", () => {
    return request(app)
      .delete("/microFrontends/")
      .set("Authorization", "Bearer " + adminToken)
      .send([microFrontendToDelete?._id])
      .expect(200);
  });

  it("should search a microfrontend", () => {
    const command: IMicroFrontendsSearchCommand = {
      paginationCommand: {
        limit: 100,
        page: 1,
      },
      name: (microFrontendToFindInSearch as IMicroFrontend)?.name,
    };

    return request(app)
      .post("/microFrontends/search/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IMicroFrontendReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();

        const toFindInSearch = result.data?.data.some(
          (el) =>
            el._id.toString() === microFrontendToFindInSearch?._id.toString()
        );
        const toNotFindInSearch = result.data?.data.some(
          (el) =>
            el._id.toString() === microFrontendToNotFindInSearch?._id.toString()
        );

        expect(toFindInSearch).toBeTruthy();
        expect(toNotFindInSearch).toEqual(false);
      });
  });
});
