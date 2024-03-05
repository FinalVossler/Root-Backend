import { emailService } from "../../../ioc";
import createEmailController from "../ports/email.controller";

const emailExpressController = createEmailController(emailService);

export default emailExpressController;
