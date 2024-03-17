import request from "supertest";

import { adminUser } from "../fixtures";
import app from "../../server";
import { userService } from "../../ioc";

// Attention!!! This test suite should be skipped. It's only used as preparation for E2E tests
jest.setTimeout(50000);
describe("Ecommerce", function () {
  const adminToken = userService.generateToken(adminUser);

  it("should be able to prepare Ecommerce", async () => {
    return request(app)
      .post("/testsPreparation/prepareEcommerce")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);
  });
});
