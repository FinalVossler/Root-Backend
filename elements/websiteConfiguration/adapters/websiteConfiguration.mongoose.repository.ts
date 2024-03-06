import { IWebsiteConfigurationUpdateCommand } from "roottypes";
import getNewTranslatedTextsForUpdate from "../../../utils/getNewTranslatedTextsForUpdate";
import fileRepository from "../../file/adapters/file.mongoose.repository";
import WebsiteConfiguration from "./websiteConfiguration.mongoose.model";
import IWebsiteConfiguration from "../ports/interfaces/IWebsiteConfiguration";
import IFile from "../../file/ports/interfaces/IFile";
import IWebsiteConfigurationRepository from "../ports/interfaces/IWebsiteConfigurationRepository";

const websiteConfigurationMongooseRepository: IWebsiteConfigurationRepository =
  {
    get: async (): Promise<IWebsiteConfiguration> => {
      const configurations: IWebsiteConfiguration[] =
        await WebsiteConfiguration.find()
          .populate("tabIcon")
          .populate("logo1")
          .populate("logo2");

      if (configurations.length === 0) {
        const newConfiguration: IWebsiteConfiguration =
          await websiteConfigurationMongooseRepository.create();
        return newConfiguration;
      }

      return configurations[0];
    },
    update: async (
      command: IWebsiteConfigurationUpdateCommand
    ): Promise<IWebsiteConfiguration> => {
      const configuration: IWebsiteConfiguration =
        await websiteConfigurationMongooseRepository.get();

      let tabIcon: IFile | undefined = command.tabIcon as IFile;
      if (command.tabIcon && !command.tabIcon._id) {
        tabIcon = await fileRepository.create(command.tabIcon);
      }

      let logo1: IFile | undefined = command.logo1 as IFile;
      if (command.logo1 && !command.logo1._id) {
        logo1 = await fileRepository.create(command.logo1);
      }

      let logo2: IFile | undefined = command.logo2 as IFile;
      if (command.logo2 && !command.logo2._id) {
        logo2 = await fileRepository.create(command.logo2);
      }

      await WebsiteConfiguration.updateOne(
        { _id: configuration._id },
        {
          $set: {
            title: command.title,
            description: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: command.description,
              oldValue: configuration.description,
            }),
            email: command.email,
            phoneNumber: command.phoneNumber,
            mainLanguages: command.mainLanguages,
            tabTitle: command.tabTitle,
            withChat: command.withChat,
            withRegistration: command.withRegistration,
            withTaskManagement: command.withTaskManagement,
            theme: command.theme,
            tabIcon: tabIcon?._id,
            logo1: logo1?._id,
            logo2: logo2?._id,
            staticText: command.staticText,
          },
        }
      );

      return await websiteConfigurationMongooseRepository.get();
    },
    create: async (): Promise<IWebsiteConfiguration> => {
      const configuration: IWebsiteConfiguration =
        await WebsiteConfiguration.create({
          title: "",
          description: [
            {
              language: "en",
              text: "Default app description",
            },
          ],
          email: "",
          tabTitle: "",
          phoneNumber: "",
          withChat: false,
          withRegistration: false,
          withTaskManagement: false,
          mainLanguages: ["en", "fr"],
        });

      return configuration as IWebsiteConfiguration;
    },
  };

export default websiteConfigurationMongooseRepository;
