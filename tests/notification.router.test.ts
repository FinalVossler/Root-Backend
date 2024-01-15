import request from "supertest";
import notificationRepository from "../elements/notification/notification.repository";
import { INotification } from "../elements/notification/notification.model";
import { IUser } from "../elements/user/user.model";
import userRepository from "../elements/user/user.repository";
import app from "../server";
import PaginationResponse from "../globalTypes/PaginationResponse";
import ResponseDto from "../globalTypes/ResponseDto";
import userService from "../elements/user/user.service";
import {
  INotificationCreateCommand,
  INotificationReadDto,
  INotificationsGetCommand,
  IUserCreateCommand,
  SuperRoleEnum,
} from "roottypes";

jest.setTimeout(50000);
describe("Notifications", () => {
  let notificationToGet: INotification | undefined;
  let notificationToSetClickedby: INotification | undefined;
  const notificationsToMarkAsClicked: INotification[] = [];
  let user: IUser | undefined;
  let userForMarkingAllNotificationsAsClicked: IUser | undefined;

  beforeAll(async () => {
    const userCreateCommand: IUserCreateCommand = {
      email: "notificationTestUser@gmail.com",
      firstName: "notificationTestUserFirstName",
      lastName: "notificationTestUserLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    user = await userRepository.getByEmail(userCreateCommand.email);
    if (!user) {
      user = await userRepository.create(userCreateCommand);
    }

    const userForMakingNotificationsAsReadCreateCommand: IUserCreateCommand = {
      email: "notificationTestUserForMarkingNotificationsAsClicked@gmail.com",
      firstName:
        "notificationTestUserForMarkingNotificationsAsClickedFirstName",
      lastName: "notificationTestUserForMarkingNotificationsAsClickedLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    userForMarkingAllNotificationsAsClicked = await userRepository.getByEmail(
      userForMakingNotificationsAsReadCreateCommand.email
    );
    if (!userForMarkingAllNotificationsAsClicked) {
      userForMarkingAllNotificationsAsClicked = await userRepository.create(
        userForMakingNotificationsAsReadCreateCommand
      );
    }

    const command: INotificationCreateCommand = {
      imageId: "",
      link: "https//facebook.com",
      text: [
        { text: "Notification for test", language: "en" },
        { text: "Notification de test", language: "fr" },
      ],
      toIds: [(user as IUser)._id.toString()],
    };
    notificationToGet = await notificationRepository.create(command);
    notificationToSetClickedby = await notificationRepository.create(command);

    const notificationsCreatePromises: Promise<INotification>[] = [];
    Array.from({ length: 10 }).forEach((el) => {
      notificationsCreatePromises.push(
        notificationRepository.create({
          ...command,
          toIds: [
            (userForMarkingAllNotificationsAsClicked as IUser)._id.toString(),
          ],
        })
      );
    });

    await Promise.all(notificationsCreatePromises);
  });

  afterAll(async () => {
    const promises: Promise<void>[] = [];

    if (user) {
      promises.push(userRepository.deleteUsers([user._id.toString()]));
    }
    if (userForMarkingAllNotificationsAsClicked) {
      promises.push(
        userRepository.deleteUsers([
          userForMarkingAllNotificationsAsClicked._id.toString(),
        ])
      );
    }

    promises.push(
      notificationRepository.deleteByIds(
        notificationsToMarkAsClicked
          .map((n) => n._id.toString())
          .concat([
            (notificationToGet as INotification)?._id.toString(),
            (notificationToSetClickedby as INotification)?._id.toString(),
          ])
      )
    );

    await Promise.all(promises);
  });

  it("should get userNotifications", () => {
    const command: INotificationsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      userId: (user as IUser)?._id.toString(),
    };
    return request(app)
      .post("/notifications/getUserNotifications")
      .send(command)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<{
          paginationResponse: PaginationResponse<INotificationReadDto>;
          totalUnclicked: number;
        }> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.totalUnclicked).toEqual(2);
      });
  });

  it("should set notification to 'clicked by some user'", async () => {
    const res = await request(app)
      .post("/notifications/setNotificationToClickedBy")
      .set(
        "Authorization",
        "Bearer " + userService.generateToken(user as IUser)
      )
      .send({ notificationId: notificationToSetClickedby?._id })
      .expect(200);

    const result: ResponseDto<void> = res.body;
    expect(result.success).toBeTruthy();

    // Now get the notifications, find the one we just marked as clicked by, and make sure that it is indeed clicked by user
    const command: INotificationsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      userId: (user as IUser)?._id.toString(),
    };

    return request(app)
      .post("/notifications/getUserNotifications")
      .send(command)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<{
          paginationResponse: PaginationResponse<INotificationReadDto>;
          totalUnclicked: number;
        }> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.paginationResponse.data
            .find(
              (n) =>
                n._id.toString() === notificationToSetClickedby?._id.toString()
            )
            ?.clickedBy.some((u) => u.toString() === user?._id.toString())
        ).toBeTruthy();
      });
  });

  it("should mark all user notifications as clicked", async () => {
    const res = await request(app)
      .post("/notifications/markAlluserNotificationsAsClicked")
      .set(
        "Authorization",
        "Bearer " +
          userService.generateToken(
            userForMarkingAllNotificationsAsClicked as IUser
          )
      );

    const result: ResponseDto<void> = res.body;

    expect(result.success).toBeTruthy();

    // Now get the notifications, and make sure all are marked as clicked
    const command: INotificationsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      userId: (
        userForMarkingAllNotificationsAsClicked as IUser
      )?._id.toString(),
    };

    return request(app)
      .post("/notifications/getUserNotifications")
      .send(command)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<{
          paginationResponse: PaginationResponse<INotificationReadDto>;
          totalUnclicked: number;
        }> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.paginationResponse.data.every((n) =>
            n?.clickedBy.some(
              (u) =>
                u.toString() ===
                userForMarkingAllNotificationsAsClicked?._id.toString()
            )
          )
        ).toBeTruthy();
      });
  });
});
