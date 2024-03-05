import request from "supertest";
import userService from "../../elements/user/ports/user.service";
import { adminUser } from "../fixtures";
import app from "../../server";

// Attention!!! This test suite should be skipped. It's only used as preparation for E2E tests
jest.setTimeout(50000);
describe.skip("MarketMaven", function () {
  const adminToken = userService.generateToken(adminUser);

  it("should be able to prepare Marketmaven", async () => {
    return request(app)
      .post("/testsPreparation/prepareMarketMaven")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);
  });
});
