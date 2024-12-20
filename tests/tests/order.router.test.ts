import request from "supertest";
import {
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityReadDto,
  IFieldReadDto,
  IOrderCreateCommand,
  IOrderReadDto,
  OrderPaymentStatusEnum,
} from "roottypes";

import IEntity from "../../elements/entity/ports/interfaces/IEntity";
import fieldMongooseRepository from "../../elements/field/adapters/field.mongoose.repository";
import { IField } from "../../elements/field/ports/interfaces/IField";
import modelMongooseRepository from "../../elements/model/adapters/model.mongoose.repository";
import IModel from "../../elements/model/ports/interfaces/IModel";
import { modelService, orderService, userService } from "../../ioc";
import {
  createCreateFieldCommand,
  createCreateModelCommand,
  getAdminUser,
} from "../fixtures";
import entityMongooseRepository from "../../elements/entity/adapters/entity.mongoose.repository";
import IOrder from "../../elements/ecommerce/order/ports/interfaces/IOrder";
import moment from "moment";
import IShippingMethod from "../../elements/ecommerce/shippingMethod/ports/interfaces/IShippingMethod";
import shippingMethodMongooseRepository from "../../elements/ecommerce/shippingMethod/adapters/shippingMethod.mongoose.repository";
import orderMongooseRepository from "../../elements/ecommerce/order/adapters/order.mongoose.repository";
import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import IPaymentMethod from "../../elements/ecommerce/paymentMethod/ports/interfaces/IPaymentMethod";
import paymentMethodMongooseRepository from "../../elements/ecommerce/paymentMethod/adapters/paymentMethod.mongoose.repository";
import IUser from "../../elements/user/ports/interfaces/IUser";

jest.setTimeout(150000);
describe("Orders", () => {
  let adminUser: IUser
  let adminToken: string = ''

  const quantity: number = 10;
  const price: number = 0.001;
  const quantityToCheckout: number = 5;
  const remainingQuantity = quantity - quantityToCheckout;

  let priceField: IField | undefined;
  let quantityField: IField | undefined;

  let sellableModel: IModel | undefined;

  let sellableEntity: IEntity | undefined;

  let shippingMethod: IShippingMethod | undefined;
  let paymentMethod: IPaymentMethod | undefined;

  let orderToUpdateAndCheckout: IOrder | undefined;
  let createdOrder: IOrderReadDto | null;

  beforeAll(async () => {
    adminUser = await getAdminUser();
    adminToken = userService.generateToken(adminUser);

    const promises: Promise<IField>[] = [];
    promises.push(
      fieldMongooseRepository.create(createCreateFieldCommand("Price")),
      fieldMongooseRepository.create(createCreateFieldCommand("Quantity"))
    );

    const res = await Promise.all(promises);
    priceField = res[0];
    quantityField = res[1];

    sellableModel = await modelMongooseRepository.create(
      createCreateModelCommand(
        "Entity test model",
        [priceField, quantityField],
        priceField._id.toString(),
        quantityField._id.toString()
      )
    );

    const entityPriceFieldValueCommand1: IEntityFieldValueCommand = {
      fieldId: priceField._id.toString(),
      files: [],
      tableValues: [],
      value: price + "",
      yearTableValues: [],
    };

    const entityQuantityFieldValueCommand2: IEntityFieldValueCommand = {
      fieldId: quantityField._id.toString(),
      files: [],
      tableValues: [],
      value: quantity + "",
      yearTableValues: [],
    };

    const createEntityCommand: IEntityCreateCommand = {
      assignedUsersIds: [],
      entityFieldValues: [
        entityPriceFieldValueCommand1,
        entityQuantityFieldValueCommand2,
      ],
      language: "en",
      modelId: sellableModel._id.toString(),
    };

    sellableEntity = await entityMongooseRepository.create(createEntityCommand);

    shippingMethod =
      await shippingMethodMongooseRepository.createShippingMethod({
        language: "en",
        name: "card",
        price,
      });

    paymentMethod = await paymentMethodMongooseRepository.createPaymentMethod({
      language: "en",
      name: "card",
      slug: "card",
    });

    const createOrderCommand: IOrderCreateCommand = {
      date: moment().toString(),
      products: [
        {
          productId: sellableEntity._id.toString(),
          price,
          quantity: quantityToCheckout,
          shippingMethodId: shippingMethod._id.toString(),
        },
      ],
      shippingAddress: {
        addressLine1: "13 Rue Beauregard",
        addressLine2: "",
        city: "Paris",
        country: "France",
        postalCode: "75002",
        region: "2",
      },
      paymentMethodId: paymentMethod._id.toString(),
      paymentStatus: OrderPaymentStatusEnum.Pending,
      userId: adminUser._id.toString(),
    };

    const orderNumber: string = orderService.generateUniqueOrderNumber();

    orderToUpdateAndCheckout = await orderMongooseRepository.createOrder(
      createOrderCommand,
      quantity * price,
      orderNumber
    );
  });

  afterAll(async () => {
    fieldMongooseRepository.deleteFields(
      [priceField, quantityField]
        .filter((el) => Boolean(el))
        .map((el) => el?._id.toString()) as string[]
    );

    if (sellableModel) {
      await modelService.deleteModels(
        [sellableModel._id.toString()],
        adminUser
      );
    }
    if (sellableEntity) {
      entityMongooseRepository.deleteEntities([sellableEntity._id.toString()]);
    }
    if (shippingMethod) {
      shippingMethodMongooseRepository.deleteShippingMethods([
        shippingMethod._id.toString(),
      ]);
    }
    if (paymentMethod) {
      paymentMethodMongooseRepository.deletePaymentMethods([
        paymentMethod._id.toString(),
      ]);
    }

    if (orderToUpdateAndCheckout) {
      orderMongooseRepository.deleteOrders([
        orderToUpdateAndCheckout._id.toString(),
      ]);
    }

    if (createdOrder) {
      orderMongooseRepository.deleteOrders([createdOrder._id.toString()]);
    }
  });

  it("should create an order and make sure the checkout session id and url are generated and that the quantity was modified", () => {
    const createOrderCommand: IOrderCreateCommand = {
      date: moment().toString(),
      products: [
        {
          productId: sellableEntity?._id.toString() || "",
          price,
          quantity: quantityToCheckout,
          shippingMethodId: shippingMethod?._id.toString() || "",
        },
      ],
      shippingAddress: {
        addressLine1: "13 Rue Beauregard",
        addressLine2: "",
        city: "Paris",
        country: "France",
        postalCode: "75002",
        region: "2",
      },
      paymentMethodId: paymentMethod?._id.toString() || "",
      paymentStatus: OrderPaymentStatusEnum.Pending,
      userId: adminUser._id.toString(),
    };

    return request(app)
      .post("/orders")
      .set("Authorization", "Bearer " + adminToken)
      .send(createOrderCommand)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IOrderReadDto> = res.body;

        createdOrder = result.data;
        expect(result.success).toBeTruthy();
        expect(result.data?.shippingAddress.city).toEqual(
          createOrderCommand.shippingAddress.city
        );
        expect(result.data?.date).toEqual(createOrderCommand.date);
        expect(result.data?.products.length).toEqual(
          createOrderCommand.products.length
        );
        expect(result.data?.paymentStatus).toEqual(
          createOrderCommand.paymentStatus
        );
        expect(result.data?.checkoutSessionId).not.toBeUndefined;
        expect(result.data?.checkoutSessionId.length).toBeGreaterThan(0);

        return request(app)
          .get("/entities/getEntity")
          .query({ entityId: sellableEntity?._id.toString() })
          .set("Authorization", "Bearer " + adminToken)
          .then((res) => {
            const result: IResponseDto<{
              entity: IEntityReadDto;
              concernedOrder: undefined | IOrderReadDto | null;
            }> = res.body;

            expect(
              result.data?.entity.entityFieldValues
                .find(
                  (f) =>
                    (f.field as IFieldReadDto)._id.toString() ===
                    quantityField?._id.toString()
                )
                ?.value.at(0)?.text ===
                remainingQuantity + ""
            );
          });
      });
  });

  it("should update order payment status", () => {
    return request(app)
      .put("/orders/updateOrderPaymentStatus")
      .set("Authorization", "Bearer " + adminToken)
      .send({
        orderId: orderToUpdateAndCheckout?._id.toString(),
        status: OrderPaymentStatusEnum.Paid,
      })
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IOrderReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.paymentStatus).toEqual(OrderPaymentStatusEnum.Paid);
      });
  });
});
