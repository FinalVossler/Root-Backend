import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import notificationController from "./notification.controller";

const {
  getUserNotifications,
  setNotificationToClickedBy,
  markAllNotificationsAsClicked,
} = notificationController;

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
  markAllNotificationsAsClicked
);

export default router;
