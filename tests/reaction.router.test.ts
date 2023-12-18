import request from "supertest";

import Message, { IPopulatedMessage } from "../elements/message/message.model";
import { IUser, SuperRole } from "../elements/user/user.model";
import userRepository from "../elements/user/user.repository";
import UserCreateCommand from "../elements/user/dtos/UserCreateCommand";
import MessageSendCommand from "../elements/message/dtos/MessageSendCommand";
import { adminUser } from "./fixtures";
import messageRepository from "../elements/message/message.repository";
import ReactionCreateCommand from "../elements/reaction/dtos/ReactionCreateCommand";
import Reaction, {
  IReaction,
  ReactionEnum,
} from "../elements/reaction/reaction.model";
import app from "../server";
import userService from "../elements/user/user.service";
import ReactionReadDto from "../elements/reaction/dtos/ReactionReadDto";
import ResponseDto from "../globalTypes/ResponseDto";
import reactionRepository from "../elements/reaction/reaction.repository";
import mongoose from "mongoose";

jest.setTimeout(50000);
describe("reactions", () => {
  let user: IUser | undefined;
  let fetchedAdminUser: IUser | undefined;
  let message: IPopulatedMessage | undefined;
  let messageToReactToTwice: IPopulatedMessage | undefined;
  let createdReaction: IReaction | undefined;
  let reactionToUpdate: IReaction | undefined;
  const adminToken = userService.generateToken(adminUser);

  beforeAll(async () => {
    const userCreateCommand: UserCreateCommand = {
      email: "reactionUser@gmail.com",
      firstName: "reactionUserFirstName",
      lastName: "reactionUserLastname",
      password: "rootroot",
      superRole: SuperRole.Normal,
    };
    user = await userRepository.create(userCreateCommand);
    fetchedAdminUser = await userRepository.getByEmail(adminUser.email);

    const messageCreateCommand: MessageSendCommand = {
      files: [],
      from: fetchedAdminUser._id,
      message: "This is the sent message",
      to: [user._id, fetchedAdminUser._id],
    };

    message = await messageRepository.sendMessage(
      messageCreateCommand,
      adminUser
    );
    messageToReactToTwice = await messageRepository.sendMessage(
      messageCreateCommand,
      adminUser
    );
    const createReactCommand: ReactionCreateCommand = {
      messageId: message?._id.toString() || "",
      reaction: ReactionEnum.Love,
    };

    reactionToUpdate = await reactionRepository.create(
      createReactCommand,
      fetchedAdminUser as IUser
    );
  });

  afterAll(async () => {
    const promises: Promise<any>[] = [];
    if (user) {
      promises.push(userRepository.deleteUsers([user._id]));
    }
    if (message) {
      promises.push(messageRepository.deleteMessage(message._id.toString()));
    }
    if (messageToReactToTwice) {
      promises.push(
        messageRepository.deleteMessage(messageToReactToTwice._id.toString())
      );
    }
    await Reaction.deleteMany({
      _id: { $in: [createdReaction?._id, reactionToUpdate?._id] },
    });
    await Promise.all(promises);
  });

  it("should react to a message", () => {
    const createReactCommand: ReactionCreateCommand = {
      messageId: message?._id.toString() || "",
      reaction: ReactionEnum.Love,
    };

    return request(app)
      .post("/reactions/")
      .send(createReactCommand)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<ReactionReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.reaction).toEqual(createReactCommand.reaction);
        expect(result.data?.user._id.toString()).toEqual(
          fetchedAdminUser?._id.toString()
        );
      });
  });

  it("when we react a second time to a message, the reaction should be updated instead of creating a new one", async () => {
    const newReactCommand: ReactionCreateCommand = {
      messageId: messageToReactToTwice?._id.toString() || "",
      reaction: ReactionEnum.Laugh,
    };

    await request(app)
      .post("/reactions/")
      .send(newReactCommand)
      .expect(200)
      .set("Authorization", "Bearer " + adminToken);

    const updatedMessage = await Message.findOne({
      _id: new mongoose.Types.ObjectId(messageToReactToTwice?._id.toString()),
    })
      .populate("reactions")
      .populate("reactions.user");
    const superAdminReactions = updatedMessage?.reactions?.filter(
      (el) => el.user._id.toString() === fetchedAdminUser?._id.toString()
    );

    expect(superAdminReactions?.length).toEqual(1);
    expect(superAdminReactions?.[0].reaction).toEqual(newReactCommand.reaction);
  });
});
