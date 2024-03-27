import request from "supertest";
import {
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityReadDto,
  IFieldReadDto,
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IOrderReadDto,
  OrderStatusEnum,
} from "roottypes";

import IEntity from "../../elements/entity/ports/interfaces/IEntity";
import fieldMongooseRepository from "../../elements/field/adapters/field.mongoose.repository";
import { IField } from "../../elements/field/ports/interfaces/IField";
import modelMongooseRepository from "../../elements/model/adapters/model.mongoose.repository";
import IModel from "../../elements/model/ports/interfaces/IModel";
import { modelService, userService } from "../../ioc";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
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

jest.setTimeout(50000);
describe("Orders", () => {
  const adminToken: string = userService.generateToken(adminUser);

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

  beforeAll(async () => {
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
      shippingMethodId: shippingMethod._id.toString(),
      paymentMethodId: paymentMethod._id.toString(),
      status: OrderStatusEnum.Pending,
      total: quantity * price,
      userId: adminUser._id.toString(),
    };

    orderToUpdateAndCheckout = await orderMongooseRepository.createOrder(
      createOrderCommand
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
  });

  it("should create an order", () => {
    const createOrderCommand: IOrderCreateCommand = {
      date: moment().toString(),
      products: [
        {
          productId: sellableEntity?._id.toString() || "",
          price,
          quantity: 2,
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
      shippingMethodId: shippingMethod?._id.toString() || "",
      paymentMethodId: paymentMethod?._id.toString() || "",
      status: OrderStatusEnum.Pending,
      total: price * 2,
      userId: adminUser._id.toString(),
    };

    return request(app)
      .post("/orders")
      .set("Authorization", "Bearer " + adminToken)
      .send(createOrderCommand)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IOrderReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(createOrderCommand.total);
        expect(result.data?.shippingAddress.city).toEqual(
          createOrderCommand.shippingAddress.city
        );
        expect(result.data?.date).toEqual(createOrderCommand.date);
        expect(result.data?.products.length).toEqual(
          createOrderCommand.products.length
        );
        expect(result.data?.status).toEqual(createOrderCommand.status);
      });
  });

  it("should update order status", () => {
    return request(app)
      .put("/orders/updateOrderStatus")
      .set("Authorization", "Bearer " + adminToken)
      .send({
        orderId: orderToUpdateAndCheckout?._id.toString(),
        status: OrderStatusEnum.OnHold,
      })
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IOrderReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.status).toEqual(OrderStatusEnum.OnHold);
      });
  });

  it("should checkout order and make sure the stock was updated", () => {
    const command: IOrderCheckoutCommand = {
      orderId: orderToUpdateAndCheckout?._id.toString() || "",
    };
    expect(orderToUpdateAndCheckout?.checkoutSessionId).toBeUndefined;

    return request(app)
      .post("/orders/checkout")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IOrderReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.checkoutSessionId).not.toBeUndefined;
        expect(result.data?.checkoutSessionId.length).toBeGreaterThan(0);

        return request(app)
          .get("/entities/getEntity")
          .query({ entityId: sellableEntity?._id.toString() })
          .set("Authorization", "Bearer " + adminToken)
          .then((res) => {
            const result: IResponseDto<IEntityReadDto> = res.body;

            expect(
              result.data?.entityFieldValues
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
});
