import request from "supertest";
import userService from "../../elements/user/ports/user.service";
import { adminUser } from "../fixtures";
import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import { IUserReadDto, IUsersGetCommand } from "roottypes";

// Attention!!! This test suite should be skipped. It's only used as preparation for E2E tests
jest.setTimeout(50000);
describe.skip("Clean", function () {
  const adminToken = userService.generateToken(adminUser);

  it("should be able to clean by deleting everything", async () => {
    await request(app)
      .post("/testsPreparation/clean")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    const getUsersCommand: IUsersGetCommand = {
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
        const result: IResponseDto<IPaginationResponse<IUserReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(1);
        expect(result.data?.data.length).toEqual(1);
      });
  });
});
