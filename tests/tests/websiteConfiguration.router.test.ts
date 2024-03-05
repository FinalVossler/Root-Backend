import request from "supertest";
import app from "../../server";
import {
  IFileCommand,
  IWebsiteConfigurationReadDto,
  IWebsiteConfigurationUpdateCommand,
} from "roottypes";
import IResponseDto from "../../globalTypes/IResponseDto";
import userService from "../../elements/user/ports/user.service";
import { adminUser } from "../fixtures";
import websiteConfigurationMongooseRepository from "../../elements/websiteConfiguration/adapters/websiteConfiguration.mongoose.repository";
import { IWebsiteConfiguration } from "../../elements/websiteConfiguration/adapters/websiteConfiguration.mongoose.model";

const adminToken: string = userService.generateToken(adminUser);

describe("WebsiteConfiguration", () => {
  it("should get website configuration", () => {
    return request(app)
      .get("/websiteConfigurations/")
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IWebsiteConfigurationReadDto> = res.body;

        expect(result.success).toBeTruthy();

        expect(result.data?.description?.at(0)?.text).toEqual(
          expect.any(String)
        );
        expect(result.data?.title).toEqual(expect.any(String));
      });
  });

  it("should be able to update website configuration", async () => {
    const conf = await websiteConfigurationMongooseRepository.get();

    const command: IWebsiteConfigurationUpdateCommand = {
      ...(conf as Required<IWebsiteConfiguration>),
      description: "This is some website description generated during tests",
      title: "Website test title",
      email: "test@gmail.com",
      tabTitle: "Test table title",
      language: "en",
      mainLanguages: ["en", "fr"],
      phoneNumber: "0623589866",
      withChat: true,
      withRegistration: true,
      withTaskManagement: true,
      tabIcon: conf.tabIcon as IFileCommand,
      logo1: conf.logo1 as IFileCommand,
      logo2: conf.logo2 as IFileCommand,
    };

    return request(app)
      .put("/websiteConfigurations/")
      .send(command)
      .set("Authorization", "Bearer " + adminToken)
      .expect(200)
      .then((res) => {
        const result: IResponseDto<IWebsiteConfigurationReadDto> = res.body;

        expect(result.success).toBeTruthy();
        expect(
          result.data?.description?.find((el) => el.language === "en")?.text
        ).toEqual(command.description);
        expect(result.data?.title).toEqual(command.title);
        expect(result.data?.email).toEqual(command.email);
        expect(result.data?.tabTitle).toEqual(command.tabTitle);
        expect(result.data?.mainLanguages.length).toEqual(
          command.mainLanguages.length
        );
        command.mainLanguages.forEach((lang) => {
          expect(
            result.data?.mainLanguages.some((el) => el === lang)
          ).toBeTruthy();
        });
        expect(result.data?.phoneNumber).toEqual(command.phoneNumber);
        expect(result.data?.withChat).toEqual(command.withChat);
        expect(result.data?.withRegistration).toEqual(command.withRegistration);
        expect(result.data?.withTaskManagement).toEqual(
          command.withTaskManagement
        );
      });
  });
});
