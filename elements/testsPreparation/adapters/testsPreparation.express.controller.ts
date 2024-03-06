import { testsPreparationService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createTestsPreparationController from "../ports/testsPreparation.controller";

const testsPreparationExpressController = createTestsPreparationController(
  testsPreparationService
);

export default createExpressController(testsPreparationExpressController);
