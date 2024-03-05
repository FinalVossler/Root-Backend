import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import notificationExpressController from "./notification.express.controller";

const {
  getUserNotifications,
  setNotificationToClickedBy,
  markAllUserNotificationsAsClicked,
} = notificationExpressController;

const router = Router();

router.post("/getUserNotifications", getUserNotifications);
router.post(
  "/setNotificationToClickedBy",
  protectMiddleware,
  setNotificationToClickedBy
);
router.post(
  "/markAlluserNotificationsAsClicked",
  protectMiddleware,
  markAllUserNotificationsAsClicked
);

export default router;
