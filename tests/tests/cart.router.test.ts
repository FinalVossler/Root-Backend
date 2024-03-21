import request from "supertest";
import {
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IUserReadDto,
  ICartUpdateCommand,
  ICartReadDto,
  IEntityReadDto,
} from "roottypes";

import { modelService, userService } from "../../ioc";
import {
  adminUser,
  createCreateFieldCommand,
  createCreateModelCommand,
} from "../fixtures";
import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import { IField } from "../../elements/field/ports/interfaces/IField";
import fieldMongooseRepository from "../../elements/field/adapters/field.mongoose.repository";
import modelMongooseRepository from "../../elements/model/adapters/model.mongoose.repository";
import entityMongooseRepository from "../../elements/entity/adapters/entity.mongoose.repository";
import IModel from "../../elements/model/ports/interfaces/IModel";
import IEntity from "../../elements/entity/ports/interfaces/IEntity";
import cartMongooseRepository from "../../elements/ecommerce/cart/adapters/cart.mongoose.repository";

jest.setTimeout(50000);
describe("Carts", () => {
  const adminToken: string = userService.generateToken(adminUser);

  let field1: IField | undefined;
  let field2: IField | undefined;

  let sellableModel: IModel | undefined;

  let sellableEntity: IEntity | undefined;

  beforeAll(async () => {
    const promises: Promise<IField>[] = [];
    promises.push(
      fieldMongooseRepository.create(
        createCreateFieldCommand("Entity test Field1")
      ),
      fieldMongooseRepository.create(
        createCreateFieldCommand("Entity test Field2")
      )
    );

    const res = await Promise.all(promises);
    field1 = res[0];
    field2 = res[1];

    sellableModel = await modelMongooseRepository.create(
      createCreateModelCommand("Entity test model", [field1, field2])
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
      modelId: sellableModel._id.toString(),
    };

    sellableEntity = await entityMongooseRepository.create(createEntityCommand);
  });

  afterAll(async () => {
    await fieldMongooseRepository.deleteFields(
      [field1, field2]
        .filter((el) => Boolean(el))
        .map((el) => el?._id.toString()) as string[]
    );

    await cartMongooseRepository.deleteUserCart(adminUser._id.toString());

    if (sellableEntity)
      await entityMongooseRepository.deleteEntities([
        sellableEntity?._id.toString(),
      ]);

    if (sellableModel) {
      await modelService.deleteModels(
        [sellableModel._id.toString()],
        adminUser
      );
    }
  });

  it("should get user cart", () => {
    return request(app)
      .get("/cart")
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<ICartReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect((result.data?.user as IUserReadDto)._id.toString()).toEqual(
          adminUser._id.toString()
        );
      });
  });

  it("should update a cart", () => {
    const quantity: number = 4;

    const command: ICartUpdateCommand = {
      products: [
        {
          productId: sellableEntity?._id.toString() || "",
          quantity,
        },
      ],
      userId: adminUser._id,
    };

    return request(app)
      .put("/cart")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<ICartReadDto> = res.body;
        expect(result.success).toBeTruthy();

        expect(result.data?.products.length).toEqual(1);
        expect(result.data?.products.at(0)?.quantity).toEqual(quantity);
        expect(
          (
            result.data?.products.at(0)?.product as IEntityReadDto
          )._id.toString()
        ).toEqual(sellableEntity?._id.toString());
      });
  });
});
