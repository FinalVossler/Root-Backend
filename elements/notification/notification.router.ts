import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import notificationService from "./notification.service";
import { INotificationReadDto, INotificationsGetCommand } from "roottypes";
import { notificationToReadDto } from "./notification.toReadDto";

const router = Router();

router.post(
  "/getUserNotifications",
  async (
    req: ConnectedRequest<any, any, INotificationsGetCommand, any>,
    res: Response<
      ResponseDto<{
        paginationResponse: PaginationResponse<INotificationReadDto>;
        totalUnclicked: number;
      }>
    >
  ) => {
    const command: INotificationsGetCommand = req.body;
    const { notifications, total, totalUnclicked } =
      await notificationService.getUserNotifications(command);

    return res.status(200).send({
      success: true,
      data: {
        totalUnclicked,
        paginationResponse: {
          data: notifications.map((p) => notificationToReadDto(p)),
          total,
        },
      },
    });
  }
);

router.post(
  "/setNotificationToClickedBy",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { notificationId: string }, any>,
    res: Response<ResponseDto<void>>
  ) => {
    await notificationService.setNotificationToClickedBy({
      notificationId: req.body.notificationId,
      userId: req.user._id.toString(),
    });

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/markAlluserNotificationsAsClicked",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { notificationId: string }, any>,
    res: Response<ResponseDto<void>>
  ) => {
    await notificationService.markAlluserNotificationsAsClicked({
      userId: req.user._id.toString(),
    });

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

export default router;
