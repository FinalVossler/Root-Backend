import createExpressController from "../../../utils/createExpressController";
import createNotificationController from "../ports/notification.controller";
import createNotificationService from "../ports/notification.service";
import notificationMongooseRepository from "./notification.mongoose.repository";

const notificationExpressController = createNotificationController(
  createNotificationService(notificationMongooseRepository)
);

export default createExpressController(notificationExpressController);
