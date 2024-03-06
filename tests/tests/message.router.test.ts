import request from "supertest";
import { adminUser } from "../fixtures";
import messageRepository from "../../elements/message/adapters/message.mongoose.repository";
import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import userMongooseRepository from "../../elements/user/adapters/user.mongoose.repository";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageMarkAllMessagesAsReadByUserCommand,
  IMessageReadDto,
  IMessageSendCommand,
  IPopulatedMessageReadDto,
  IUserCreateCommand,
  SuperRoleEnum,
} from "roottypes";
import { userService } from "../../ioc";
import IUser from "../../elements/user/ports/interfaces/IUser";
import IPopulatedMessage from "../../elements/message/ports/interfaces/IPopulatedMessage";

const adminToken = userService.generateToken(adminUser);

jest.setTimeout(50000);
describe("messages", () => {
  let messageToDelete: IPopulatedMessage | undefined;
  let user1: IUser | undefined;
  let user2: IUser | undefined;
  let user3ForTotalUnreadMessages: IUser | undefined;
  let user4ForLastMessageInConversation: IUser | undefined;
  let messagesBetweenUser1AndUser2: IPopulatedMessage[] = [];
  let messagesBetweenUser1AndUser3: IPopulatedMessage[] = [];
  let messagesBetweenAdminUserAndUser3: IPopulatedMessage[] = [];
  let messagesBetweenAdminUserAndUser4: IPopulatedMessage[] = [];
  let lastMessage: IPopulatedMessage | undefined;
  const lastMessageMessage: string = "Last message";

  beforeAll(async () => {
    const user1CreateCommand: IUserCreateCommand = {
      email: "user1ForMessages@gmail.com",
      firstName: "User1ForMessagesFirstName ",
      lastName: "User1ForMessagesLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    user1 = await userMongooseRepository.getByEmail(user1CreateCommand.email);
    if (!user1) {
      user1 = await userService.createUser(user1CreateCommand, adminUser);
    }
    const user2CreateCommand: IUserCreateCommand = {
      email: "user2ForMessages@gmail.com",
      firstName: "User2ForMessagesFirstName ",
      lastName: "User2ForMessagesLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    user2 = await userMongooseRepository.getByEmail(user2CreateCommand.email);
    if (!user2) {
      user2 = await userService.createUser(user2CreateCommand, adminUser);
    }
    const user3CreateCommand: IUserCreateCommand = {
      email: "user3ForMessages@gmail.com",
      firstName: "User3ForMessagesFirstName ",
      lastName: "User3ForMessagesLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    user3ForTotalUnreadMessages = await userMongooseRepository.getByEmail(
      user3CreateCommand.email
    );
    if (!user3ForTotalUnreadMessages) {
      user3ForTotalUnreadMessages = await userService.createUser(
        user3CreateCommand,
        adminUser
      );
    }

    const user4CreateCommand: IUserCreateCommand = {
      email: "userEForMessages@gmail.com",
      firstName: "UserEForMessagesFirstName ",
      lastName: "UserEForMessagesLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    user4ForLastMessageInConversation = await userMongooseRepository.getByEmail(
      user4CreateCommand.email
    );
    if (!user4ForLastMessageInConversation) {
      user4ForLastMessageInConversation = await userService.createUser(
        user4CreateCommand,
        adminUser
      );
    }

    // sending message between admin user and user1
    const messageToDeleteSendCommand: IMessageSendCommand = {
      files: [],
      from: adminUser._id.toString(),
      message: "Message to delete",
      to: [adminUser._id.toString(), user1._id.toString()],
    };
    messageToDelete = await messageRepository.sendMessage(
      messageToDeleteSendCommand,
      adminUser
    );

    // sending messages between user 1 and user 2
    const messagesBetweenUser1AndUser2Promises = Array.from({ length: 6 }).map(
      (el) => {
        const messageSendCommand: IMessageSendCommand = {
          files: [],
          from: (user1 as IUser)._id.toString(),
          message: "Message to delete",
          to: [
            (user1 as IUser)?._id.toString(),
            (user2 as IUser)._id.toString(),
          ],
        };

        return messageRepository.sendMessage(
          messageSendCommand,
          user1 as IUser
        );
      }
    );

    messagesBetweenUser1AndUser2 = await Promise.all(
      messagesBetweenUser1AndUser2Promises
    );

    // sending messages between admin and user 3
    const messagesBetweenAdminAndUser3Promises = Array.from({ length: 6 }).map(
      (el) => {
        const messageSendCommand: IMessageSendCommand = {
          files: [],
          from: (adminUser as IUser)._id.toString(),
          message: "Message to delete",
          to: [
            (adminUser as IUser)?._id.toString(),
            (user3ForTotalUnreadMessages as IUser)._id.toString(),
          ],
        };

        return messageRepository.sendMessage(
          messageSendCommand,
          user1 as IUser
        );
      }
    );

    messagesBetweenAdminUserAndUser3 = await Promise.all(
      messagesBetweenAdminAndUser3Promises
    );

    // sending messages between admin and user 4
    const messageFromAdminToUser4SendCommand: IMessageSendCommand = {
      files: [],
      from: (adminUser as IUser)._id.toString(),
      message: "Message to delete",
      to: [
        (adminUser as IUser)?._id.toString(),
        (user4ForLastMessageInConversation as IUser)._id.toString(),
      ],
    };
    const messagesBetweenAdminAndUser4Promises = Array.from({ length: 6 }).map(
      (el, i) => {
        return messageRepository.sendMessage(
          messageFromAdminToUser4SendCommand,
          adminUser as IUser
        );
      }
    );

    messagesBetweenAdminUserAndUser4 = await Promise.all(
      messagesBetweenAdminAndUser4Promises
    );

    lastMessage = await messageRepository.sendMessage(
      { ...messageFromAdminToUser4SendCommand, message: lastMessageMessage },
      adminUser as IUser
    );
  });

  afterAll(async () => {
    const promises: Promise<any>[] = [];
    if (messageToDelete) {
      promises.push(
        messageRepository.deleteMessage(messageToDelete?._id.toString() || "")
      );
    }
    if (user1) {
      promises.push(userMongooseRepository.deleteUsers([user1._id.toString()]));
    }

    if (user2) {
      promises.push(userMongooseRepository.deleteUsers([user2._id.toString()]));
    }
    if (user3ForTotalUnreadMessages) {
      promises.push(
        userMongooseRepository.deleteUsers([
          user3ForTotalUnreadMessages._id.toString(),
        ])
      );
    }
    if (user4ForLastMessageInConversation) {
      promises.push(
        userMongooseRepository.deleteUsers([
          user4ForLastMessageInConversation._id.toString(),
        ])
      );
    }
    promises.push(
      ...messagesBetweenUser1AndUser2
        .concat(messagesBetweenUser1AndUser3)
        .concat(messagesBetweenAdminUserAndUser3)
        .concat(messagesBetweenAdminUserAndUser4)
        .concat([lastMessage as IPopulatedMessage])
        .map((m) => messageRepository.deleteMessage(m._id.toString()))
    );

    await Promise.all(promises);
  });

  it("should send a message from a user to another", () => {
    const command: IMessageSendCommand = {
      files: [],
      from: adminUser._id.toString(),
      message: "message sent",
      to: [adminUser._id.toString(), (user1 as IUser)?._id.toString()],
    };

    return request(app)
      .post("/messages/")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPopulatedMessageReadDto> = res.body;

        expect(result.data?.files.length).toEqual(0);
        expect(result.data?.from._id.toString()).toEqual(
          command.from.toString()
        );
        expect(result.data?.to.length).toEqual(2);
        expect(result.data?.message).toEqual(command.message);
      });
  });

  it("should get the messages between two users", () => {
    const command: IMessageGetBetweenUsersCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      usersIds: [
        (user1 as IUser)._id.toString(),
        (user2 as IUser)._id.toString(),
      ],
    };
    const user1Token = userService.generateToken(user1 as IUser);
    return request(app)
      .post("/messages/get")
      .set("Authorization", "Bearer " + user1Token)
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IMessageReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(messagesBetweenUser1AndUser2.length);
        // the messages should only be read by the sender
        expect(
          result.data?.data.filter(
            (message) =>
              message.read.length === 1 &&
              [...message.read].find(
                (readBy) => readBy.toString() === user1?._id.toString()
              )
          ).length
        ).toEqual(messagesBetweenUser1AndUser2.length);
      });
  });

  it("shouldn't be able to get the messages for a user that doesn't belong to a conversation", () => {
    const command: IMessageGetBetweenUsersCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      usersIds: [
        (user1 as IUser)?._id.toString(),
        (user2 as IUser)._id.toString(),
      ],
    };
    return request(app)
      .post("/messages/get")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .expect(500);
  });

  it("should get the total unread messages in a conversation", async () => {
    const res = await request(app)
      .post("/messages/conversationTotalUnreadMessages")
      .set(
        "Authorization",
        "Bearer " + userService.generateToken(user1 as IUser)
      )
      .expect(200)
      .send([(user1 as IUser)._id.toString(), (user2 as IUser)._id.toString()]);
    const numberOfUnreadMessagesForUser1Result: IResponseDto<number> = res.body;
    expect(numberOfUnreadMessagesForUser1Result.data).toEqual(0);

    const res2 = await request(app)
      .post("/messages/conversationTotalUnreadMessages")
      .set(
        "Authorization",
        "Bearer " + userService.generateToken(user2 as IUser)
      )
      .expect(200)
      .send([(user1 as IUser)._id.toString(), (user2 as IUser)._id.toString()]);
    const numberOfUnreadMessagesForUser2Result: IResponseDto<number> =
      res2.body;
    expect(numberOfUnreadMessagesForUser2Result.data).toEqual(
      messagesBetweenUser1AndUser2.length
    );
  });

  it("should mark conversation messages as read by user", async () => {
    const command: IMessageMarkAllMessagesAsReadByUserCommand = {
      to: [(user1 as IUser)?._id.toString(), (user2 as IUser)._id.toString()],
    };
    await request(app)
      .post("/messages/markAllConversationMessagesAsReadByUser")
      .send(command)
      .set(
        "Authorization",
        "Bearer " + userService.generateToken(user2 as IUser)
      )
      .expect(200);

    const res2 = await request(app)
      .post("/messages/conversationTotalUnreadMessages")
      .set(
        "Authorization",
        "Bearer " + userService.generateToken(user2 as IUser)
      )
      .expect(200)
      .send([(user1 as IUser)._id.toString(), (user2 as IUser)._id.toString()]);
    const numberOfUnreadMessagesForUser2Result: IResponseDto<number> =
      res2.body;
    expect(numberOfUnreadMessagesForUser2Result.data).toEqual(0);
  });

  it("should be able to delete one's own message", () => {
    return request(app)
      .delete("/messages/")
      .set("Authorization", "Bearer " + adminToken)
      .query({ messageId: messageToDelete?._id.toString() })
      .expect(200);
  });

  it("shouldn't be able to delete a message sent by somebody else", async () => {
    const token: string = userService.generateToken(user1 as IUser);
    return request(app)
      .delete("/messages/")
      .set("Authorization", "Bearer " + token)
      .query({ messageId: messageToDelete?._id.toString() })
      .expect(500);
  });

  it("should get total unread messages", async () => {
    const res = await request(app)
      .post("/messages/userTotalUnreadMessages")
      .set(
        "Authorization",
        "Bearer " +
          userService.generateToken(user3ForTotalUnreadMessages as IUser)
      )
      .expect(200);

    const result: IResponseDto<number> = res.body;

    expect(result.success).toBeTruthy();
    expect(result.data).toEqual(
      messagesBetweenUser1AndUser3.length +
        messagesBetweenAdminUserAndUser3.length
    );

    // Now mark the messages of a conversation (user1 and user3) as read and check the total unread messages again:
    const command: IMessageMarkAllMessagesAsReadByUserCommand = {
      to: [
        (user1 as IUser)?._id.toString(),
        (user3ForTotalUnreadMessages as IUser)._id.toString(),
      ],
    };
    await request(app)
      .post("/messages/markAllConversationMessagesAsReadByUser")
      .send(command)
      .set(
        "Authorization",
        "Bearer " +
          userService.generateToken(user3ForTotalUnreadMessages as IUser)
      )
      .expect(200);

    // Now check that the totalunread messages of user3 is equal to the total unread messages between him and the admin
    const res2 = await request(app)
      .post("/messages/userTotalUnreadMessages")
      .set(
        "Authorization",
        "Bearer " +
          userService.generateToken(user3ForTotalUnreadMessages as IUser)
      )
      .expect(200);

    const result2: IResponseDto<number> = res2.body;

    expect(result2.success).toBeTruthy();
    expect(result2.data).toEqual(messagesBetweenAdminUserAndUser3.length);
  });

  it("should get last conversations last messages", () => {
    const command: IMessageGetLastConversations = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    return request(app)
      .post("/messages/getLastConversationsLastMessages")
      .set(
        "Authorization",
        "Bearer " +
          userService.generateToken(user4ForLastMessageInConversation as IUser)
      )
      .send(command)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IMessageReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toEqual(1);
        expect(result.data?.data.at(0)?.message.toString()).toEqual(
          lastMessageMessage
        );
      });
  });
});
