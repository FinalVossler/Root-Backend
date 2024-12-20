import request from "supertest";
import {
  IPaymentMethodCreateCommand,
  IPaymentMethodReadDto,
  IPaymentMethodUpdateCommand,
} from "roottypes";

import paymentMethodMongooseRepository from "../../elements/ecommerce/paymentMethod/adapters/paymentMethod.mongoose.repository";
import IPaymentMethod from "../../elements/ecommerce/paymentMethod/ports/interfaces/IPaymentMethod";
import { userService } from "../../ioc";
import { getAdminUser } from "../fixtures";
import IResponseDto from "../../globalTypes/IResponseDto";
import app from "../../server";
import IUser from "../../elements/user/ports/interfaces/IUser";

jest.setTimeout(50000);
describe("PaymentMethods", () => {
  let adminUser: IUser
  let adminToken: string = ''

  let paymentMethodToGet: IPaymentMethod | undefined;
  let paymentMethodToUpdate: IPaymentMethod | undefined;
  let paymentMethodToDelete: IPaymentMethod | undefined;
  let createdPaymentMethod: IPaymentMethod | null;

  beforeAll(async () => {
    adminUser = await getAdminUser();
    adminToken = userService.generateToken(adminUser);

    paymentMethodToGet =
      await paymentMethodMongooseRepository.createPaymentMethod({
        language: "en",
        name: "Bank Transfer",
        slug: "ach_credit_transfer",
      });

    paymentMethodToUpdate =
      await paymentMethodMongooseRepository.createPaymentMethod({
        language: "en",
        name: "card",
        slug: "card",
      });

    paymentMethodToDelete =
      await paymentMethodMongooseRepository.createPaymentMethod({
        language: "en",
        name: "cardToDelete",
        slug: "card-to-delete",
      });
  });

  afterAll(async () => {
    const ids: string[] = [
      paymentMethodToDelete,
      paymentMethodToGet,
      paymentMethodToUpdate,
      createdPaymentMethod,
    ]
      .filter((el) => Boolean(el))
      .map((el) => el?._id.toString()) as string[];

    await paymentMethodMongooseRepository.deletePaymentMethods(ids);
  });

  it("should get payment methods", () => {
    return request(app)
      .get("/paymentMethods")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaymentMethodReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.length).toBeGreaterThan(0);
        expect(
          result.data?.find((el) => el.slug === paymentMethodToGet?.slug)
        ).not.toBeNull();
      });
  });

  it("should create a payment method", () => {
    const createCommand: IPaymentMethodCreateCommand = {
      language: "en",
      name: "Created payment method",
      slug: "createdPaymentMethod",
    };
    return request(app)
      .post("/paymentMethods")
      .send(createCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((result) => {
        const res: IResponseDto<IPaymentMethodReadDto> = result.body;

        expect(res.success).toBeTruthy();

        createdPaymentMethod = res.data;

        expect(res.data?.slug).toEqual(createCommand.slug);
        expect(res.data?.name.at(0)?.text).toEqual(createCommand.name);
      });
  });

  it("should update a payment method", () => {
    const updateCommand: IPaymentMethodUpdateCommand = {
      _id: paymentMethodToUpdate?._id.toString() || "",
      language: "en",
      name: "Updated name",
      slug: "updated_slug",
    };

    return request(app)
      .put("/paymentMethods")
      .send(updateCommand)
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<IPaymentMethodReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.slug).toEqual(updateCommand.slug);
        expect(result.data?.name.at(0)?.text).toEqual(updateCommand.name);
      });
  });

  it("should delete a payment method", () => {
    return request(app)
      .get("/paymentMethods")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaymentMethodReadDto[]> = res.body;

        const foundPaymentMethod = result.data?.find(
          (el) => el._id.toString() === paymentMethodToDelete?._id.toString()
        );

        expect(foundPaymentMethod).not.toBeNull();

        return request(app)
          .delete("/paymentMethods")
          .set("Authorization", "Bearer " + adminToken)
          .send({ paymentMethodsIds: [paymentMethodToDelete?._id.toString()] })
          .then(() => {
            return request(app)
              .get("/paymentMethods")
              .set("Authorization", "Bearer " + adminToken)
              .expect(200)
              .then((res) => {
                const result: IResponseDto<IPaymentMethodReadDto[]> = res.body;

                const foundPaymentMethod = result.data?.find(
                  (el) =>
                    el._id.toString() === paymentMethodToDelete?._id.toString()
                );

                expect(foundPaymentMethod).toBeUndefined;
              });
          });
      });
  });
});
