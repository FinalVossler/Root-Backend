import PostCreateCommand from "./dto/PostCreateCommand";
import { IPost } from "./post.model";
import postRepository from "./post.repository";

const postService = {
  createPost: async (command: PostCreateCommand): Promise<IPost> => {
    const post: IPost = await postRepository.createPost(command);

    return post;
  },
};

export default postService;
