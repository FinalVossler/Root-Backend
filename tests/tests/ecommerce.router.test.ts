import request from "supertest";

import { getAdminUser } from "../fixtures";
import app from "../../server";
import { userService } from "../../ioc";
import IUser from "../../elements/user/ports/interfaces/IUser";

// Attention!!! This test suite should be skipped. It's only used as preparation for E2E tests
jest.setTimeout(50000);
describe.skip("Ecommerce", function () {

  let adminUser: IUser
  let adminToken: string = ''

  beforeAll(async () => {
    adminUser = await getAdminUser();
    adminToken = userService.generateToken(adminUser);
  })

  it("should be able to prepare Ecommerce", async () => {
    return request(app)
      .post("/testsPreparation/prepareEcommerce")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);
  });
});
