import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import WebsiteConfiguration, {
  IWebsiteConfiguration,
} from "./websiteConfiguration.model";

const websiteConfigurationRepository = {
  get: async (): Promise<IWebsiteConfiguration> => {
    const configurations: IWebsiteConfiguration[] =
      await WebsiteConfiguration.find();

    if (configurations.length === 0) {
      const newConfiguration: IWebsiteConfiguration =
        await websiteConfigurationRepository.create();
      return newConfiguration;
    }

    return configurations[0];
  },
  update: async (
    command: WebsiteConfigurationUpdateCommand
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    await WebsiteConfiguration.updateOne(
      { _id: configuration._id },
      {
        $set: {
          title: command.title,
          email: command.email,
          phoneNumber: command.phoneNumber,
          tabTitle: command.tabTitle,
          withChat: command.withChat,
          withRegistration: command.withRegistration,
          theme: command.theme,
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
      });

    return configuration as IWebsiteConfiguration;
  },
};

export default websiteConfigurationRepository;
