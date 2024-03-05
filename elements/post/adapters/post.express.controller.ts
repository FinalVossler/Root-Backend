import createExpressController from "../../../utils/createExpressController";
import createPostController from "../ports/post.controller";
import createPostService from "../ports/post.service";
import postMongooseRepository from "./post.mongoose.repository";

const postExpressController = createPostController(
  createPostService(postMongooseRepository)
);

export default createExpressController(postExpressController);
