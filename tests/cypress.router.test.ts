import request from "supertest";
import userService from "../elements/user/user.service";
import { adminUser } from "./fixtures";
import app from "../server";
import UsersGetCommand from "../elements/user/dtos/UsersGetCommand";
import ResponseDto from "../globalTypes/ResponseDto";
import PaginationResponse from "../globalTypes/PaginationResponse";
import UserReadDto from "../elements/user/dtos/UserReadDto";

// Attention!!! This test suite should be skipped. It's only used to test the cypress preparation scripts
// when we are about to run cypress tests
jest.setTimeout(50000);
describe.skip("cypress router", function () {
  const adminToken = userService.generateToken(adminUser);

  it.skip("should be able to clean by deleting everything", async () => {
    await request(app)
      .post("/cypress/clean")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    const getUsersCommand: UsersGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    await request(app)
      .post("/users/getUsers")
      .set("Authorization", "Bearer " + adminToken)
      .send(getUsersCommand)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<UserReadDto>> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(1);
        expect(result.data?.data.length).toEqual(1);
      });
  });

  it("should be able to prepare Marketmaven", async () => {
    return request(app)
      .post("/cypress/prepareMarketMaven")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);
  });
});
