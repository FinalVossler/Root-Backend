import request from "supertest";
import { adminUser } from "../fixtures";
import app from "../../server";
import IResponseDto from "../../globalTypes/IResponseDto";
import postMongooseRepository from "../../elements/post/adapters/post.mongoose.repository";
import IPaginationResponse from "../../globalTypes/IPaginationResponse";
import {
  IPostCreateCommand,
  IPostReadDto,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
  PostDesignEnum,
  PostVisibilityEnum,
} from "roottypes";
import { userService } from "../../ioc";
import IPost from "../../elements/post/ports/interfaces/IPost";

jest.setTimeout(50000);
const adminToken: string = userService.generateToken(adminUser);
describe("Posts", () => {
  let createdPost: IPostReadDto | undefined;
  let postToUpdate: IPost | undefined;
  let postToDelete: IPost | undefined;
  let postToFindInSearch: IPost | undefined;
  let postToNotFindInSearch: IPost | undefined;

  beforeAll(async () => {
    const command: IPostCreateCommand = {
      children: [],
      design: PostDesignEnum.Default,
      files: [],
      language: "en",
      posterId: adminUser._id.toString(),
      visibility: PostVisibilityEnum.Public,
      title: "Post to update title",
      code: "",
      content: "This is the post to update content",
      subTitle: "This is the post to update subtitle",
    };

    postToUpdate = await postMongooseRepository.create(command, adminUser);
    postToDelete = await postMongooseRepository.create(command, adminUser);
    postToFindInSearch = await postMongooseRepository.create(
      { ...command, title: "To find in search" },
      adminUser
    );
    postToNotFindInSearch = await postMongooseRepository.create(
      { ...command, title: "Not there" },
      adminUser
    );
  });

  afterAll(async () => {
    const promises: Promise<void>[] = [];
    if (createdPost) {
      promises.push(postMongooseRepository.delete(createdPost._id.toString()));
    }
    if (postToUpdate) {
      promises.push(postMongooseRepository.delete(postToUpdate._id.toString()));
    }
    if (postToDelete) {
      promises.push(postMongooseRepository.delete(postToDelete._id.toString()));
    }
    if (postToFindInSearch) {
      promises.push(
        postMongooseRepository.delete(postToFindInSearch._id.toString())
      );
    }
    if (postToNotFindInSearch) {
      promises.push(
        postMongooseRepository.delete(postToNotFindInSearch._id.toString())
      );
    }

    await Promise.all(promises);
  });

  it("should create a post", () => {
    const command: IPostCreateCommand = {
      children: [],
      design: PostDesignEnum.Default,
      files: [],
      language: "en",
      posterId: adminUser._id.toString(),
      visibility: PostVisibilityEnum.Public,
      title: "Post title",
      code: "",
      content: "This is the post content",
      subTitle: "This is the post subtitle",
    };

    return request(app)
      .post("/posts/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)

      .then((res) => {
        const result: IResponseDto<IPostReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.title?.at(0)?.text).toEqual(command.title);
        expect(result.data?.subTitle?.at(0)?.text).toEqual(command.subTitle);
        expect(result.data?.content?.at(0)?.text).toEqual(command.content);

        createdPost = result.data as IPostReadDto;
      });
  });

  it("should get user posts", () => {
    const command: IPostsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      userId: adminUser._id.toString(),
      visibilities: [PostVisibilityEnum.Private, PostVisibilityEnum.Public],
    };

    return request(app)
      .post("/posts/getUserPosts/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IPostReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.total).toBeGreaterThan(0);
      });
  });

  it("should search for posts", () => {
    const command: IPostsSearchCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      posterId: adminUser._id.toString(),
      title: postToFindInSearch?.title?.at(0)?.text || "",
      visibilities: [PostVisibilityEnum.Private, PostVisibilityEnum.Public],
    };

    return request(app)
      .post("/posts/search/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IPostReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.data.some(
            (el) => el._id.toString() === postToFindInSearch?._id.toString()
          )
        ).toBeTruthy();
        expect(
          result.data?.data.some(
            (el) => el._id.toString() === postToNotFindInSearch?._id.toString()
          )
        ).toEqual(false);
      });
  });

  it("should update a post", () => {
    const command: IPostUpdateCommand = {
      _id: (postToUpdate as IPost)?._id.toString(),
      children: [],
      design: PostDesignEnum.Banner,
      files: [],
      language: "en",
      visibility: PostVisibilityEnum.Private,
      title: "Updated post title",
      code: "",
      content: "This is the updated post content",
      subTitle: "This is the updated post subtitle",
    };

    return request(app)
      .put("/posts/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)

      .then((res) => {
        const result: IResponseDto<IPostReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.title?.at(0)?.text).toEqual(command.title);
        expect(result.data?.subTitle?.at(0)?.text).toEqual(command.subTitle);
        expect(result.data?.content?.at(0)?.text).toEqual(command.content);
        expect(result.data?.design).toEqual(command.design);
        expect(result.data?.visibility).toEqual(command.visibility);

        createdPost = result.data as IPostReadDto;
      });
  });

  it("should delete a post", async () => {
    await request(app)
      .delete("/posts/")
      .query({ postId: postToDelete?._id.toString() })
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    // Now make sure that the post was deleted
    const command: IPostsGetCommand = {
      paginationCommand: {
        limit: 10,
        page: 1,
      },
      userId: adminUser._id.toString(),
      visibilities: [PostVisibilityEnum.Private, PostVisibilityEnum.Public],
    };

    return request(app)
      .post("/posts/getUserPosts/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IPaginationResponse<IPostReadDto>> =
          res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.data.some(
            (el) => el._id.toString() === postToDelete?._id.toString()
          )
        ).toEqual(false);
      });
  });
});
