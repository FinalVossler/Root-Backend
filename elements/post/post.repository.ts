import createFiles from "../../utils/createFiles";
import { IFile } from "../file/file.model";
import PostCreateCommand from "./dto/PostCreateCommand";
import Post, { IPost } from "./post.model";

const postRepository = {
  createPost: async (command: PostCreateCommand): Promise<IPost> => {
    const createdFiles: IFile[] = await createFiles(command.files);

    const post: IPost = (await Post.create({
      title: command.title,
      content: command.content,
      files: createdFiles.map((f) => f._id),
      poster: command.poster,
    })) as IPost;

    return post;
  },
};

export default postRepository;
