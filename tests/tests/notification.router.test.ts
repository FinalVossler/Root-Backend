import request from "supertest";
import notificationRepository from "../../elements/notification/adapters/notification.mongoose.repository";
import userMongooseRepository from "../../elements/user/adapters/user.mongoose.repository";
import app from "../../server";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import IResponseDto from "../../globalTypes/IResponseDto";
import {
  INotificationCreateCommand,
  INotificationReadDto,
  INotificationsGetCommand,
  IUserCreateCommand,
  SuperRoleEnum,
} from "roottypes";
import INotification from "../../elements/notification/ports/interfaces/INotification";
import IUser from "../../elements/user/ports/interfaces/IUser";
import { userService } from "../../ioc";

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
    user = await userMongooseRepository.getByEmail(userCreateCommand.email);
    if (!user) {
      user = await userMongooseRepository.create(userCreateCommand);
    }

    const userForMakingNotificationsAsReadCreateCommand: IUserCreateCommand = {
      email: "notificationTestUserForMarkingNotificationsAsClicked@gmail.com",
      firstName:
        "notificationTestUserForMarkingNotificationsAsClickedFirstName",
      lastName: "notificationTestUserForMarkingNotificationsAsClickedLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    userForMarkingAllNotificationsAsClicked =
      await userMongooseRepository.getByEmail(
        userForMakingNotificationsAsReadCreateCommand.email
      );
    if (!userForMarkingAllNotificationsAsClicked) {
      userForMarkingAllNotificationsAsClicked =
        await userMongooseRepository.create(
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
      promises.push(userMongooseRepository.deleteUsers([user._id.toString()]));
    }
    if (userForMarkingAllNotificationsAsClicked) {
      promises.push(
        userMongooseRepository.deleteUsers([
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
        const result: IResponseDto<{
          paginationResponse: IPaginationResponse<INotificationReadDto>;
          totalUnclicked: number;
        }> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.totalUnclicked).toBeGreaterThanOrEqual(2);
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

    const result: IResponseDto<void> = res.body;
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
        const result: IResponseDto<{
          paginationResponse: IPaginationResponse<INotificationReadDto>;
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

    const result: IResponseDto<void> = res.body;

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
        const result: IResponseDto<{
          paginationResponse: IPaginationResponse<INotificationReadDto>;
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
