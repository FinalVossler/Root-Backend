import { IFile } from "../file/file.model";
import fileRepository from "../file/file.repository";
import { IUser } from "../user/user.model";
import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import WebsiteConfiguration, {
  IWebsiteConfiguration,
} from "./websiteConfiguration.model";

const websiteConfigurationRepository = {
  get: async (): Promise<IWebsiteConfiguration> => {
    const configurations: IWebsiteConfiguration[] =
      await WebsiteConfiguration.find().populate("tabIcon").populate('logo1').populate('logo2');

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

    let tabIcon: IFile | undefined = command.tabIcon;
    if (command.tabIcon && !command.tabIcon._id) {
      tabIcon = await fileRepository.create(command.tabIcon);
    }

    let logo1: IFile | undefined = command.logo1;
    if (command.logo1 && !command.logo1._id) {
      logo1 = await fileRepository.create(command.logo1);
    }

    let logo2: IFile | undefined = command.logo2;
    if (command.logo2 && !command.logo2._id) {
      logo2 = await fileRepository.create(command.logo2);
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
          withTaskManagement: command.withTaskManagement,
          theme: command.theme,
          tabIcon: tabIcon?._id,
          logo1: logo1?._id,
          logo2: logo2?._id,
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
        withTaskManagement: false,
        mainLanguages: ["en", "fr"],
      });

    return configuration as IWebsiteConfiguration;
  },
};

export default websiteConfigurationRepository;
