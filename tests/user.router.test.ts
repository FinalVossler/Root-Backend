import request from "supertest";

import app from "../server";
import LoginUserCommand from "../elements/user/dtos/UserLoginCommand";
import ResponseDto from "../globalTypes/ResponseDto";
import UserReadDto, {
  UserReadDtoWithLastReadMessageInConversation,
} from "../elements/user/dtos/UserReadDto";
import UserRegisterCommand from "../elements/user/dtos/UserRegisterCommand";
import userService from "../elements/user/user.service";
import userModel, { IUser, SuperRole } from "../elements/user/user.model";
import mongoose from "mongoose";
import ChatGetContactsCommand from "../elements/user/dtos/ChatGetContactsCommand";
import PaginationResponse from "../globalTypes/PaginationResponse";
import userRepository from "../elements/user/user.repository";
import UserCreateCommand from "../elements/user/dtos/UserCreateCommand";
import UserUpdateCommand from "../elements/user/dtos/UserUpdateCommand";
import { IFile } from "../elements/file/file.model";
import UsersGetCommand from "../elements/user/dtos/UsersGetCommand";
import UsersSearchCommand from "../elements/user/dtos/UsersSearchCommand";
import { IRole, Permission } from "../elements/role/role.model";
import roleRepository from "../elements/role/role.repository";
import RoleCreateCommand from "../elements/role/dto/RoleCreateCommand";
import UserSearchByRoleCommand from "../elements/user/dtos/UserSearchByRoleCommand";
import doNothing from "../utils/doNothing";
import { adminUser } from "./fixtures";

describe.skip("user router", () => {
  const adminToken = userService.generateToken(adminUser);

  let userToUpdate: IUser | undefined;
  let userToCreate: IUser | undefined;
  let userToSearchByRole: IUser | undefined;
  let adminProfilePicture: IFile | undefined;
  let role: IRole | undefined;

  beforeAll(async () => {
    try {
      // Create a role to use in the search user by role route
      const roleCreateCommand: RoleCreateCommand = {
        entityPermissions: [],
        language: "en",
        name: "Role 1",
        permissions: [Permission.CreateField, Permission.ReadField],
      };
      role = await roleRepository.create(roleCreateCommand);

      const userToSearchByRoleCreateCommand: UserCreateCommand = {
        email: "searchByRole@updating.com",
        firstName: "searchByRoleFirstName",
        lastName: "searchByRoleLastName",
        password: "searchByRolePassword",
        superRole: SuperRole.Normal,
        roleId: role._id.toString(),
      };
      await userRepository.deleteByEmail(userToSearchByRoleCreateCommand.email);
      userToSearchByRole = await userRepository.create(
        userToSearchByRoleCreateCommand
      );

      // Create the user to use in the user update test
      const userToUpdateCreateCommand: UserCreateCommand = {
        email: "update@updating.com",
        firstName: "updateFirstName",
        lastName: "updateLastName",
        password: "updatePassword",
        superRole: SuperRole.Normal,
        roleId: role._id.toString(),
      };
      await userRepository.deleteByEmail(userToUpdateCreateCommand.email);
      userToUpdate = await userRepository.create(userToUpdateCreateCommand);
    } catch (e) {
      doNothing();
    }

    // Take the admin profile picture in order to use it to update another user's profile picture.
    const admin = await userModel
      .findById(adminUser._id)
      .populate("profilePicture")
      .populate("role");
    adminProfilePicture = admin?.profilePicture?.["_doc"];
  });

  afterAll(async () => {
    if (userToSearchByRole) {
      await userRepository.deleteUsers([userToSearchByRole?._id]);
    }
    if (userToUpdate) {
      await userRepository.deleteUsers([userToUpdate?._id]);
    }
    if (userToCreate) {
      await userRepository.deleteUsers([userToCreate._id]);
    }
    if (role) {
      await roleRepository.deleteRoles([role._id]);
    }
  });

  it("registers POST /users/register", async () => {
    const registerCommand: UserRegisterCommand = {
      email: "register@registering.com",
      firstName: "registerFirstName",
      lastName: "registerLastName",
      password: "registerPassword",
    };

    type RegisterReponse = ResponseDto<{
      token: string;
      expiresIn: string;
      user: UserReadDto;
    }>;

    const res = await request(app)
      .post("/users/register")
      .send(registerCommand);

    const body = res.body as RegisterReponse;
    const registeredUserId = body.data?.user._id.toString() || "";

    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
          expiresIn: expect.any(String),
          user: expect.objectContaining({
            firstName: registerCommand.firstName,
            lastName: registerCommand.lastName,
            email: registerCommand.email,
          }),
        }),
      })
    );

    // Now test deleting by deleting the registered user
    return request(app)
      .delete("/users")
      .set("Authorization", "Bearer " + adminToken)
      .send([registeredUserId])
      .expect(200);
  });

  it("logins POST /users/login => token", async () => {
    const loginCommand: LoginUserCommand = {
      email: "hamza.khalifa@esprit.tn",
      password: "rootroot",
    };

    const loginResponse = await request(app)
      .post("/users/login")
      .send(loginCommand)
      .expect(200);

    expect(loginResponse.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
        }),
      })
    );
  });

  it("me GET /users/me => receive information on current user", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    type ResponseType = ResponseDto<UserReadDto>;
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
        }),
      })
    );

    expect((res.body as ResponseType).data?.firstName).toEqual("Hamza");
  });

  it("should get chat contacts GET /users/getChatContacts", () => {
    const command: ChatGetContactsCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    type ResponseType = ResponseDto<PaginationResponse<UserReadDto>>;

    return request(app)
      .post("/users/getChatContacts")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseType = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              total: expect.any(Number),
              data: expect.arrayContaining([
                expect.objectContaining({
                  firstName: expect.any(String),
                  lastName: expect.any(String),
                  email: expect.any(String),
                }),
              ]),
            }),
          })
        );
      });
  });

  it("should get contacts by ids GET /users/getContactsByIds", () => {
    return request(app)
      .get("/users/getContactsByIds")
      .set("Authorization", "Bearer " + adminToken)
      .query({ usersIds: adminUser._id.toString() })
      .then((res) => {
        const result: ResponseDto<UserReadDto[]> = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.arrayContaining([
              expect.objectContaining({
                firstName: expect.any(String),
                lastName: expect.any(String),
                email: expect.any(String),
              }),
            ]),
          })
        );
      });
  });

  it("should get user GET /users/getUser", () => {
    return request(app)
      .get("/users/getUser")
      .query({ userId: adminUser._id.toString() })
      .then((res) => {
        const result: ResponseDto<UserReadDto> = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              email: adminUser.email,
            }),
          })
        );
      });
  });

  it("should get getUsersWithTheirLastReadMessagesInConversation GET /users/getUsersWithTheirLastReadMessagesInConversation", () => {
    return request(app)
      .get("/users/getUsersWithTheirLastReadMessagesInConversation")
      .set("Authorization", "Bearer " + adminToken)
      .query({ "usersIds[]": [adminUser._id.toString()] })
      .then((res) => {
        const result: ResponseDto<
          UserReadDtoWithLastReadMessageInConversation[]
        > = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.arrayContaining([
              expect.objectContaining({
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
                lastReadMessageInConversation: expect.objectContaining({
                  message: expect.any(String),
                }),
              }),
            ]),
          })
        );
      });
  });

  it("should update user PUT /users", () => {
    const userUpdateCommand: UserUpdateCommand = {
      _id: userToUpdate?._id as mongoose.Types.ObjectId,
      firstName: "updatedFirstName",
      lastName: "updatedLastName",
      email: "updatedEmail@updating.com",
      hasMessagingEmailsActivated: true,
    };

    return request(app)
      .put("/users/")
      .set("Authorization", "Bearer " + adminToken)
      .send(userUpdateCommand)
      .then((res) => {
        const result: ResponseDto<UserReadDto> = res.body;
        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              _id: userUpdateCommand._id.toString(),
              firstName: userUpdateCommand.firstName,
              lastName: userUpdateCommand.lastName,
              email: userUpdateCommand.email,
              hasMessagingEmailsActivated:
                userUpdateCommand.hasMessagingEmailsActivated,
            }),
          })
        );
      });
  });

  it("should update a user' profile picture PUT /users/updateProfilePicture", () => {
    const userToken = userService.generateToken(userToUpdate as IUser);

    return request(app)
      .put("/users/updateProfilePicture")
      .send(adminProfilePicture)
      .set("Authorization", "Bearer " + userToken)
      .then((res) => {
        const result: ResponseDto<UserReadDto> = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              profilePicture: expect.objectContaining({
                url: adminProfilePicture?.url,
              }),
            }),
          })
        );
      });
  });

  it("should create user POST /users/", () => {
    const command: UserCreateCommand = {
      email: "create@creating.com",
      firstName: "createUserFirstName",
      lastName: "createUserLastName",
      password: "rootroot",
      superRole: SuperRole.Normal,
    };
    return request(app)
      .post("/users")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<UserReadDto> = res.body;

        userToCreate = result.data as IUser;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              firstName: command.firstName,
              lastName: command.lastName,
              email: command.email,
            }),
          })
        );
      });
  });

  it("should get users GET /users", () => {
    const command: UsersGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    return request(app)
      .post("/users/getUsers")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: ResponseDto<PaginationResponse<UserReadDto>> = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              total: expect.any(Number),
              data: expect.arrayContaining([
                expect.objectContaining({
                  firstName: expect.any(String),
                  lastName: expect.any(String),
                  email: expect.any(String),
                }),
              ]),
            }),
          })
        );
      });
  });

  it("should search for users POST /users/search", async () => {
    const command1: UsersSearchCommand = {
      firstNameOrLastNameOrEmail: "Hamza",
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    const res = await request(app).post("/users/search").send(command1);

    const result: ResponseDto<PaginationResponse<UserReadDto>> = res.body;

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          total: expect.any(Number),
          data: expect.arrayContaining([
            expect.objectContaining({
              firstName: expect.any(String),
              lastName: expect.any(String),
              email: expect.any(String),
            }),
          ]),
        }),
      })
    );
  });

  it("should search for users by role POST /users/search", async () => {
    const command1: UserSearchByRoleCommand = {
      roleId: role?._id.toString() || "",
      searchCommand: {
        firstNameOrLastNameOrEmail: userToSearchByRole?.firstName || "",
        paginationCommand: {
          limit: 10,
          page: 1,
        },
      },
    };
    const res = await request(app).post("/users/searchByRole").send(command1);

    const result: ResponseDto<PaginationResponse<UserReadDto>> = res.body;

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          total: expect.any(Number),
          data: expect.arrayContaining([
            expect.objectContaining({
              firstName: userToSearchByRole?.firstName,
              lastName: userToSearchByRole?.lastName,
              email: userToSearchByRole?.email,
            }),
          ]),
        }),
      })
    );
  });
});
