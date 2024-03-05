import { notificationService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createNotificationController from "../ports/notification.controller";

const notificationExpressController =
  createNotificationController(notificationService);

export default createExpressController(notificationExpressController);
