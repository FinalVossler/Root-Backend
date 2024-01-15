import request from "supertest";
import { IPost } from "../elements/post/post.model";
import { adminUser } from "./fixtures";
import app from "../server";
import userService from "../elements/user/user.service";
import ResponseDto from "../globalTypes/ResponseDto";
import postRepository from "../elements/post/post.repository";
import PaginationResponse from "../globalTypes/PaginationResponse";
import {
  IPostCreateCommand,
  IPostReadDto,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
  PostDesignEnum,
  PostVisibilityEnum,
} from "roottypes";

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

    postToUpdate = await postRepository.create(command, adminUser);
    postToDelete = await postRepository.create(command, adminUser);
    postToFindInSearch = await postRepository.create(
      { ...command, title: "To find in search" },
      adminUser
    );
    postToNotFindInSearch = await postRepository.create(
      { ...command, title: "Not there" },
      adminUser
    );
  });

  afterAll(async () => {
    const promises: Promise<void>[] = [];
    if (createdPost) {
      promises.push(postRepository.delete(createdPost._id.toString()));
    }
    if (postToUpdate) {
      promises.push(postRepository.delete(postToUpdate._id.toString()));
    }
    if (postToDelete) {
      promises.push(postRepository.delete(postToDelete._id.toString()));
    }
    if (postToFindInSearch) {
      promises.push(postRepository.delete(postToFindInSearch._id.toString()));
    }
    if (postToNotFindInSearch) {
      promises.push(
        postRepository.delete(postToNotFindInSearch._id.toString())
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
        const result: ResponseDto<IPostReadDto> = res.body;

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
        const result: ResponseDto<PaginationResponse<IPostReadDto>> = res.body;

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
        const result: ResponseDto<PaginationResponse<IPostReadDto>> = res.body;

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
        const result: ResponseDto<IPostReadDto> = res.body;

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
        const result: ResponseDto<PaginationResponse<IPostReadDto>> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.data.some(
            (el) => el._id.toString() === postToDelete?._id.toString()
          )
        ).toEqual(false);
      });
  });
});
