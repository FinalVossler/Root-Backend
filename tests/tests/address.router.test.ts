import request from "supertest";
import {
  IAddressCreateCommand,
  IAddressReadDto,
  IAddressUpdateCommand,
  SuperRoleEnum,
} from "roottypes";

import addressMongooseRepository from "../../elements/ecommerce/address/adapters/address.mongoose.repository";
import { userService } from "../../ioc";
import { adminUser } from "../fixtures";
import IResponseDto from "../../globalTypes/IResponseDto";
import app from "../../server";
import IAddress from "../../elements/ecommerce/address/ports/interfaces/IAddress";
import IUser from "../../elements/user/ports/interfaces/IUser";
import userMongooseRepository from "../../elements/user/adapters/user.mongoose.repository";

jest.setTimeout(50000);
describe("Addresses", () => {
  const adminToken: string = userService.generateToken(adminUser);
  let addressToGet: IAddress | undefined;
  let addressToUpdate: IAddress | undefined;
  let addressToDelete: IAddress | undefined;
  let createdAddress: IAddressReadDto | null;
  let otherUser: IUser | undefined;
  let otherUserAddress: IAddress | null;

  beforeAll(async () => {
    addressToGet = await addressMongooseRepository.createAddress({
      addressLine1: "13 Rue Beauregard",
      addressLine2: "",
      region: "île de France",
      city: "Paris",
      country: "France",
      postalCode: "75002",
      userId: adminUser._id,
    });

    addressToUpdate = await addressMongooseRepository.createAddress({
      addressLine1: "15 Rue Marc Seguin",
      addressLine2: "",
      region: "île de France",
      city: "Paris",
      country: "France",
      postalCode: "75002",
      userId: adminUser._id,
    });

    addressToDelete = await addressMongooseRepository.createAddress({
      addressLine1: "15 Boulevard Dubreuil",
      addressLine2: "",
      region: "île de France",
      city: "Orsay",
      country: "France",
      postalCode: "91400",
      userId: adminUser._id,
    });

    otherUser = await userMongooseRepository.create({
      email: "otherUser@gmailTest.com",
      firstName: "Other",
      lastName: "User",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    });

    otherUserAddress = await addressMongooseRepository.createAddress({
      addressLine1: "13 Rue de l'autre utilisateur",
      addressLine2: "",
      region: "île de France",
      city: "Autre",
      country: "France Autre",
      postalCode: "91400",
      userId: otherUser._id,
    });
  });

  afterAll(async () => {
    const ids: string[] = [
      addressToDelete,
      addressToGet,
      addressToUpdate,
      createdAddress,
      otherUserAddress,
    ]
      .filter((el) => Boolean(el))
      .map((el) => el?._id.toString()) as string[];

    await addressMongooseRepository.deleteAddresses(ids);
    if (otherUser?._id) {
      await userService.deleteUsers([otherUser?._id.toString()], adminUser);
    }
  });

  it("should get addresses", () => {
    return request(app)
      .get("/addresses")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IAddressReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.length).toBeGreaterThan(0);
        expect(
          result.data?.find(
            (el) => el.addressLine1 === addressToGet?.addressLine1
          )
        ).not.toBeNull();
        expect(
          result.data?.find(
            (el) => el.addressLine1 === otherUserAddress?.addressLine1
          )
        ).not.toBeNull();
      });
  });

  it("should get addresses of a specific user", () => {
    return request(app)
      .post("/addresses/getUserAddresses")
      .set("Authorization", "Bearer " + adminToken)
      .send({ userId: otherUser?._id.toString() })
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IAddressReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.length).toBeGreaterThan(0);
        expect(
          result.data?.find(
            (el) => el.addressLine1 === addressToGet?.addressLine1
          )
        ).toBeUndefined();
        expect(
          result.data?.find(
            (el) => el.addressLine1 === otherUserAddress?.addressLine1
          )
        ).not.toBeUndefined();

        return request(app)
          .post("/addresses/getUserAddresses")
          .set("Authorization", "Bearer " + adminToken)
          .send({ userId: adminUser?._id.toString() })
          .expect(200)
          .then((res) => {
            const result: IResponseDto<IAddressReadDto[]> = res.body;

            expect(result.success).toBeTruthy();
            expect(result.data?.length).toBeGreaterThan(0);
            expect(
              result.data?.find(
                (el) => el.addressLine1 === addressToGet?.addressLine1
              )
            ).not.toBeUndefined();
            expect(
              result.data?.find(
                (el) => el.addressLine1 === otherUserAddress?.addressLine1
              )
            ).toBeUndefined();
          });
      });
  });

  it("should create an address", () => {
    const createCommand: IAddressCreateCommand = {
      addressLine1: "address line of a created address",
      addressLine2: "address line 2",
      region: "Created address region",
      city: "City",
      country: "Country",
      postalCode: "91400",
      userId: adminUser._id,
    };
    return request(app)
      .post("/addresses")
      .send(createCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((result) => {
        const res: IResponseDto<IAddressReadDto> = result.body;

        expect(res.success).toBeTruthy();

        createdAddress = res.data;

        expect(res.data?.addressLine1).toEqual(createCommand.addressLine1);
        expect(res.data?.addressLine2).toEqual(createCommand.addressLine2);
        expect(res.data?.region).toEqual(createCommand.region);
        expect(res.data?.city).toEqual(createCommand.city);
        expect(res.data?.country).toEqual(createCommand.country);
        expect(res.data?.postalCode).toEqual(createCommand.postalCode);
      });
  });

  it("should update an address", () => {
    const updateCommand: IAddressUpdateCommand = {
      _id: addressToUpdate?._id.toString() as string,
      addressLine1: "Updated address line 1",
      addressLine2: "Updated address line 2",
      region: "Updated region",
      city: "updated city",
      country: "Updated country",
      postalCode: "updated postal code",
      userId: adminUser._id,
    };

    return request(app)
      .put("/addresses")
      .send(updateCommand)
      .set("Authorization", "Bearer " + adminToken)
      .then((res) => {
        const result: IResponseDto<IAddressReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.addressLine1).toEqual(updateCommand.addressLine1);
        expect(result.data?.addressLine2).toEqual(updateCommand.addressLine2);
        expect(result.data?.region).toEqual(updateCommand.region);
        expect(result.data?.city).toEqual(updateCommand.city);
        expect(result.data?.country).toEqual(updateCommand.country);
        expect(result.data?.postalCode).toEqual(updateCommand.postalCode);
      });
  });

  it("should delete an address", () => {
    return request(app)
      .get("/addresses")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IAddressReadDto[]> = res.body;

        const foundAddress = result.data?.find(
          (el) => el._id.toString() === addressToDelete?._id.toString()
        );

        expect(foundAddress).not.toBeNull();

        return request(app)
          .delete("/addresses")
          .set("Authorization", "Bearer " + adminToken)
          .send({ addressesIds: [addressToDelete?._id.toString()] })
          .then(() => {
            return request(app)
              .get("/addresses")
              .set("Authorization", "Bearer " + adminToken)
              .expect(200)
              .then((res) => {
                const result: IResponseDto<IAddressReadDto[]> = res.body;

                const foundAddress = result.data?.find(
                  (el) => el._id.toString() === addressToDelete?._id.toString()
                );

                expect(foundAddress).toBeUndefined;
              });
          });
      });
  });
});
