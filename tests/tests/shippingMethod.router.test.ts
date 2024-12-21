import request from "supertest";
import {
  IShippingMethodCreateCommand,
  IShippingMethodReadDto,
  IShippingMethodUpdateCommand,
} from "roottypes";

import shippingMethodMongooseRepository from "../../elements/ecommerce/shippingMethod/adapters/shippingMethod.mongoose.repository";

import IShippingMethod from "../../elements/ecommerce/shippingMethod/ports/interfaces/IShippingMethod";
import { userService } from "../../ioc";
import IResponseDto from "../../globalTypes/IResponseDto";
import app from "../../server";
import IUser from "../../elements/user/ports/interfaces/IUser";
import { getAdminUser } from "../fixtures";

jest.setTimeout(50000);
describe("ShippingMethods", () => {
  let adminUser: IUser
  let adminToken: string = ''

  let shippingMethodToGet: IShippingMethod | undefined;
  let shippingMethodToUpdate: IShippingMethod | undefined;
  let shippingMethodToDelete: IShippingMethod | undefined;
  let createdShippingMethod: IShippingMethod | null;

  beforeAll(async () => {
    adminUser = await getAdminUser();
    adminToken = userService.generateToken(adminUser);

    shippingMethodToGet =
      await shippingMethodMongooseRepository.createShippingMethod({
        language: "en",
        name: "Bank Transfer",
        price: 20,
      });

    shippingMethodToUpdate =
      await shippingMethodMongooseRepository.createShippingMethod({
        language: "en",
        name: "card",
        price: 40,
      });

    shippingMethodToDelete =
      await shippingMethodMongooseRepository.createShippingMethod({
        language: "en",
        name: "cardToDelete",
        price: 50,
      });
  });

  afterAll(async () => {
    const ids: string[] = [
      shippingMethodToDelete,
      shippingMethodToGet,
      shippingMethodToUpdate,
      createdShippingMethod,
    ]
      .filter((el) => Boolean(el))
      .map((el) => el?._id.toString()) as string[];

    await shippingMethodMongooseRepository.deleteShippingMethods(ids);
  });

  it("should get shipping methods", () => {
    return request(app)
      .get("/shippingMethods")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IShippingMethodReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.length).toBeGreaterThan(0);
        expect(
          result.data?.find((el) => el.price === shippingMethodToGet?.price)
        ).not.toBeNull();
      });
  });

  it("should create a shipping method", () => {
    const createCommand: IShippingMethodCreateCommand = {
      language: "en",
      name: "Created shipping method",
      price: 100,
    };
    return request(app)
      .post("/shippingMethods")
      .send(createCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((result) => {
        const res: IResponseDto<IShippingMethodReadDto> = result.body;

        expect(res.success).toBeTruthy();

        createdShippingMethod = res.data;

        expect(res.data?.price).toEqual(createCommand.price);
        expect(res.data?.name.at(0)?.text).toEqual(createCommand.name);
      });
  });

  it("should update a shipping method", () => {
    const updateCommand: IShippingMethodUpdateCommand = {
      _id: shippingMethodToUpdate?._id.toString() || "",
      language: "en",
      name: "Updated name",
      price: 999,
    };

    return request(app)
      .put("/shippingMethods")
      .send(updateCommand)
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<IShippingMethodReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.price).toEqual(updateCommand.price);
        expect(result.data?.name.at(0)?.text).toEqual(updateCommand.name);
      });
  });

  it("should delete a shipping method", () => {
    return request(app)
      .get("/shippingMethods")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IShippingMethodReadDto[]> = res.body;

        const foundShippingMethod = result.data?.find(
          (el) => el._id.toString() === shippingMethodToDelete?._id.toString()
        );

        expect(foundShippingMethod).not.toBeNull();

        return request(app)
          .delete("/shippingMethods")
          .set("Authorization", "Bearer " + adminToken)
          .send({
            shippingMethodsIds: [shippingMethodToDelete?._id.toString()],
          })
          .then(() => {
            return request(app)
              .get("/shippingMethods")
              .set("Authorization", "Bearer " + adminToken)
              .expect(200)
              .then((res) => {
                const result: IResponseDto<IShippingMethodReadDto[]> = res.body;

                const foundShippingMethod = result.data?.find(
                  (el) =>
                    el._id.toString() === shippingMethodToDelete?._id.toString()
                );

                expect(foundShippingMethod).toBeUndefined;
              });
          });
      });
  });
});
