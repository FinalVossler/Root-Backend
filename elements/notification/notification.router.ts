import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import ResponseDto from "../../globalTypes/ResponseDto";
import NotificationReadDto, { toReadDto } from "./dto/NotificationReadDto";
import NotificationsGetCommand from "./dto/NotificationsGetCommand";
import notificationService from "./notification.service";

const router = Router();

router.post(
  "/getUserNotifications",
  async (
    req: ConnectedRequest<any, any, NotificationsGetCommand, any>,
    res: Response<
      ResponseDto<{
        paginationResponse: PaginationResponse<NotificationReadDto>;
        totalUnclicked: number;
      }>
    >
  ) => {
    const command: NotificationsGetCommand = req.body;
    const { notifications, total, totalUnclicked } =
      await notificationService.getUserNotifications(command);

    return res.status(200).send({
      success: true,
      data: {
        totalUnclicked,
        paginationResponse: {
          data: notifications.map((p) => toReadDto(p)),
          total,
        },
      },
    });
  }
);

router.post(
  "/setNotificationToClicked",
  async (
    req: ConnectedRequest<any, any, { notificationId: string }, any>,
    res: Response<ResponseDto<void>>
  ) => {
    await notificationService.setNotificationToClicked(req.body.notificationId);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

export default router;
