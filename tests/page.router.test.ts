import request from "supertest";
import pageRepository from "../elements/page/page.repository";
import { IPost } from "../elements/post/post.model";
import { adminUser } from "./fixtures";
import postRepository from "../elements/post/post.repository";
import { IPage } from "../elements/page/page.model";
import app from "../server";
import ResponseDto from "../globalTypes/ResponseDto";
import userService from "../elements/user/user.service";
import {
  IPageCreateCommand,
  IPageReadDto,
  IPageUpdateCommand,
  IPostCreateCommand,
  PostDesignEnum,
  PostVisibilityEnum,
} from "roottypes";

jest.setTimeout(50000);
const adminToken = userService.generateToken(adminUser);
describe("Pages", () => {
  let post1: IPost | undefined;
  let post2: IPost | undefined;
  let page1ToGet: IPage | undefined;
  let page2ToGet: IPage | undefined;
  let page3ToUpdate: IPage | undefined;
  let page4ToDelete: IPage | undefined;

  beforeAll(async () => {
    // Posts creation
    const postCreateCommand: IPostCreateCommand = {
      children: [],
      design: PostDesignEnum.Default,
      files: [],
      language: "en",
      posterId: adminUser._id.toString(),
      visibility: PostVisibilityEnum.Public,
      title: "Post 1 Title for pages test",
    };

    post1 = await postRepository.create(postCreateCommand, adminUser);
    post2 = await postRepository.create(
      {
        ...postCreateCommand,
        title: "Post 1 Title for pages test",
      },
      adminUser
    );

    // Pages creation
    const pageCreateCommand: IPageCreateCommand = {
      language: "en",
      posts: [post1._id.toString(), post2._id.toString()],
      showInHeader: true,
      showInSideMenu: true,
      title: "Page title",
    };

    page1ToGet = await pageRepository.create(pageCreateCommand);
    page2ToGet = await pageRepository.create(pageCreateCommand);
    page3ToUpdate = await pageRepository.create(pageCreateCommand);
    page4ToDelete = await pageRepository.create(pageCreateCommand);
  });

  afterAll(async () => {
    const promises: Promise<void>[] = [];

    if (post1) {
      promises.push(postRepository.delete(post1._id.toString()));
    }
    if (post2) {
      promises.push(postRepository.delete(post2._id.toString()));
    }
    if (page1ToGet) {
      promises.push(pageRepository.delete(page1ToGet._id.toString()));
    }
    if (page2ToGet) {
      promises.push(pageRepository.delete(page2ToGet._id.toString()));
    }
    if (page3ToUpdate) {
      promises.push(pageRepository.delete(page3ToUpdate._id.toString()));
    }
    if (page4ToDelete) {
      promises.push(pageRepository.delete(page4ToDelete._id.toString()));
    }

    await Promise.all(promises);
  });

  it("should get pages", () => {
    return request(app)
      .get("/pages/")
      .expect(200)
      .then((res) => {
        const result: ResponseDto<IPageReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.some(
            (page) => page._id.toString() === page1ToGet?._id.toString()
          )
        ).toBeTruthy();
        expect(
          result.data?.some(
            (page) => page._id.toString() === page2ToGet?._id.toString()
          )
        ).toBeTruthy();
      });
  });

  it("should create a page", () => {
    const pageCreateCommand: IPageCreateCommand = {
      language: "en",
      posts: [(post1 as IPost)._id.toString(), (post2 as IPost)._id.toString()],
      showInHeader: true,
      showInSideMenu: true,
      title: "Page for page creation",
    };

    return request(app)
      .post("/pages/")
      .set("Authorization", "Bearer " + adminToken)
      .send(pageCreateCommand)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<IPageReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.title.at(0)?.text).toEqual(pageCreateCommand.title);
        expect(result.data?.posts.length).toEqual(2);
      });
  });

  it("should update a page", () => {
    const pageUpdateCommand: IPageUpdateCommand = {
      _id: (page3ToUpdate as IPage)?._id.toString(),
      language: "en",
      posts: [(post1 as IPost)?._id.toString()],
      showInHeader: false,
      showInSideMenu: false,
      title: "New page title after update",
    };

    return request(app)
      .put("/pages/")
      .set("Authorization", "Bearer " + adminToken)
      .send(pageUpdateCommand)
      .expect(200)
      .then((res) => {
        const result: ResponseDto<IPageReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(result.data?.title.at(0)?.text).toEqual(pageUpdateCommand.title);
        expect(result.data?.posts.length).toEqual(1);
      });
  });

  it("should delete pages", async () => {
    // Make sure that the page we are about to delete exists in the list of pages
    const getPagesRes = await request(app).get("/pages/").expect(200);

    const getPagesResult: ResponseDto<IPageReadDto[]> = getPagesRes.body;

    expect(getPagesResult.success).toBeTruthy();
    expect(
      getPagesResult.data?.some(
        (page) => page._id.toString() === page4ToDelete?._id.toString()
      )
    ).toEqual(true);

    // Now delete the page
    const res = await request(app)
      .delete("/pages/")
      .send([page4ToDelete?._id.toString()])
      .set("Authorization", "Bearer " + adminToken)
      .expect(200);

    const result: ResponseDto<void> = res.body;
    expect(result.success).toBeTruthy();

    // Now make sure that the deleted page no longer exists in the list of pages
    return request(app)
      .get("/pages/")
      .expect(200)
      .then((res) => {
        const result: ResponseDto<IPageReadDto[]> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.some(
            (page) => page._id.toString() === page4ToDelete?._id.toString()
          )
        ).toEqual(false);
      });
  });
});