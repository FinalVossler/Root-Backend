import fileRepository from "../file/file.repository";
import { IUser } from "../user/user.model";
import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import WebsiteConfiguration, {
  IWebsiteConfiguration,
} from "./websiteConfiguration.model";

const websiteConfigurationRepository = {
  get: async (): Promise<IWebsiteConfiguration> => {
    const configurations: IWebsiteConfiguration[] =
      await WebsiteConfiguration.find().populate("tabIcon");

    if (configurations.length === 0) {
      const newConfiguration: IWebsiteConfiguration =
        await websiteConfigurationRepository.create();
      return newConfiguration;
    }

    return configurations[0];
  },
  update: async (
    command: WebsiteConfigurationUpdateCommand,
    currentUser: IUser
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    let tabIcon = command.tabIcon;
    if (command.tabIcon && !command.tabIcon._id) {
      tabIcon = await fileRepository.create(command.tabIcon, currentUser);
    }

    await WebsiteConfiguration.updateOne(
      { _id: configuration._id },
      {
        $set: {
          title: command.title,
          email: command.email,
          phoneNumber: command.phoneNumber,
          mainLanguages: command.mainLanguages,
          tabTitle: command.tabTitle,
          withChat: command.withChat,
          withRegistration: command.withRegistration,
          theme: command.theme,
          tabIcon: tabIcon._id,
        },
      }
    );

    return await websiteConfigurationRepository.get();
  },
  create: async (): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await WebsiteConfiguration.create({
        title: "",
        email: "",
        tabTitle: "",
        phoneNumber: "",
        withChat: false,
        withRegistration: false,
        mainLanguages: ["en", "fr"],
      });

    return configuration as IWebsiteConfiguration;
  },
};

export default websiteConfigurationRepository;
