import { websiteConfigurationService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createWebsiteConfigurationController from "../ports/websiteConfiguration.controller";

const websiteConfigurationExpressService = createWebsiteConfigurationController(
  websiteConfigurationService
);

export default createExpressController(websiteConfigurationExpressService);
