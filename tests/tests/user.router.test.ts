import request from "supertest";

import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import userService from "../../elements/user/ports/user.service";
import userModel, {
  IUser,
} from "../../elements/user/adapters/user.mongoose.model";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import userMongooseRepository from "../../elements/user/adapters/user.mongoose.repository";
import { IFile } from "../../elements/file/adapters/file.mongoose.model";
import { IRole } from "../../elements/role/role.model";
import roleRepository from "../../elements/role/adapters/role.mongoose.repository";
import doNothing from "../../utils/doNothing";
import { adminUser } from "../fixtures";
import {
  IChatGetContactsCommand,
  IRoleCreateCommand,
  IUserCreateCommand,
  IUserLoginCommand,
  IUserReadDto,
  IUserReadDtoWithLastReadMessageInConversationReadDto,
  IUserRegisterCommand,
  IUserSearchByRoleCommand,
  IUserUpdateCommand,
  IUsersGetCommand,
  IUsersSearchCommand,
  PermissionEnum,
  SuperRoleEnum,
} from "roottypes";

jest.setTimeout(50000);
describe("Users", () => {
  const adminToken = userService.generateToken(adminUser);

  let userToUpdate: IUser | undefined;
  let userToCreate: IUserReadDto | undefined;
  let userToSearchByRole: IUser | undefined;
  let adminProfilePicture: IFile | undefined;
  let role: IRole | undefined;

  beforeAll(async () => {
    try {
      // Create a role to use in the search user by role route
      const roleCreateCommand: IRoleCreateCommand = {
        entityPermissions: [],
        language: "en",
        name: "Role 1",
        permissions: [PermissionEnum.CreateField, PermissionEnum.ReadField],
      };
      role = await roleRepository.create(roleCreateCommand);

      const userToSearchByRoleCreateCommand: IUserCreateCommand = {
        email: "searchByRole@updating.com",
        firstName: "searchByRoleFirstName",
        lastName: "searchByRoleLastName",
        password: "searchByRolePassword",
        superRole: SuperRoleEnum.Normal,
        roleId: role._id.toString(),
      };
      await userMongooseRepository.deleteByEmail(
        userToSearchByRoleCreateCommand.email
      );
      userToSearchByRole = await userMongooseRepository.create(
        userToSearchByRoleCreateCommand
      );

      // Create the user to use in the user update test
      const userToUpdateCreateCommand: IUserCreateCommand = {
        email: "update@updating.com",
        firstName: "updateFirstName",
        lastName: "updateLastName",
        password: "updatePassword",
        superRole: SuperRoleEnum.Normal,
        roleId: role._id.toString(),
      };
      await userMongooseRepository.deleteByEmail(
        userToUpdateCreateCommand.email
      );
      userToUpdate = await userMongooseRepository.create(
        userToUpdateCreateCommand
      );
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
      await userMongooseRepository.deleteUsers([
        userToSearchByRole?._id.toString(),
      ]);
    }
    if (userToUpdate) {
      await userMongooseRepository.deleteUsers([userToUpdate?._id.toString()]);
    }
    if (userToCreate) {
      await userMongooseRepository.deleteUsers([userToCreate._id.toString()]);
    }
    if (role) {
      await roleRepository.deleteRoles([role._id.toString()]);
    }
  });

  it("registers POST /users/register", async () => {
    const registerCommand: IUserRegisterCommand = {
      email: "register@registering.com",
      firstName: "registerFirstName",
      lastName: "registerLastName",
      password: "registerPassword",
    };

    type RegisterReponse = IResponseDto<{
      token: string;
      expiresIn: string;
      user: IUserReadDto;
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
    const loginCommand: IUserLoginCommand = {
      email: "hk.kh.pro@gmail.com",
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

    type ResponseType = IResponseDto<IUserReadDto>;
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
    const command: IChatGetContactsCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };

    type ResponseType = IResponseDto<IPaginationResponse<IUserReadDto>>;

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
      .post("/users/getContactsByIds")
      .set("Authorization", "Bearer " + adminToken)
      .send({ usersIds: [adminUser._id.toString()] })
      .then((res) => {
        const result: IResponseDto<IUserReadDto[]> = res.body;

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
        const result: IResponseDto<IUserReadDto> = res.body;

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
      .post("/users/getUsersWithTheirLastReadMessagesInConversation")
      .set("Authorization", "Bearer " + adminToken)
      .send({ usersIds: [adminUser._id.toString()] })
      .then((res) => {
        const result: IResponseDto<
          IUserReadDtoWithLastReadMessageInConversationReadDto[]
        > = res.body;

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: expect.arrayContaining([
              expect.objectContaining({
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
              }),
            ]),
          })
        );
      });
  });

  it("should update user PUT /users", () => {
    const userUpdateCommand: IUserUpdateCommand = {
      _id: userToUpdate?._id.toString() || "",
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
        const result: IResponseDto<IUserReadDto> = res.body;
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

  it.skip("should update a user' profile picture PUT /users/updateProfilePicture", () => {
    const userToken = userService.generateToken(userToUpdate as IUser);

    return request(app)
      .put("/users/updateProfilePicture")
      .send(adminProfilePicture)
      .set("Authorization", "Bearer " + userToken)
      .then((res) => {
        const result: IResponseDto<IUserReadDto> = res.body;

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
    const command: IUserCreateCommand = {
      email: "create@creating.com",
      firstName: "createUserFirstName",
      lastName: "createUserLastName",
      password: "rootroot",
      superRole: SuperRoleEnum.Normal,
    };
    return request(app)
      .post("/users")
      .set("Authorization", "Bearer " + adminToken)
      .send(command)
      .then((res) => {
        const result: IResponseDto<IUserReadDto> = res.body;

        userToCreate = result.data as IUserReadDto;

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
    const command: IUsersGetCommand = {
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
        const result: IResponseDto<IPaginationResponse<IUserReadDto>> =
          res.body;

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
    const command1: IUsersSearchCommand = {
      firstNameOrLastNameOrEmail: "Hamza",
      paginationCommand: {
        limit: 10,
        page: 1,
      },
    };
    const res = await request(app).post("/users/search").send(command1);

    const result: IResponseDto<IPaginationResponse<IUserReadDto>> = res.body;

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
    const command1: IUserSearchByRoleCommand = {
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

    const result: IResponseDto<IPaginationResponse<IUserReadDto>> = res.body;

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
