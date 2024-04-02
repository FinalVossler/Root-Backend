import {
  IPostCreateCommand,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";

import IPost from "./IPost";
import IUser from "../../../user/ports/interfaces/IUser";

interface IPostRepository {
  create: (command: IPostCreateCommand, currentUser: IUser) => Promise<IPost>;
  getUserPosts: (
    command: IPostsGetCommand,
    currentUser: IUser
  ) => Promise<{ posts: IPost[]; total: number }>;
  search: (
    command: IPostsSearchCommand
  ) => Promise<{ posts: IPost[]; total: number }>;
  getById: (postId: string) => Promise<IPost | null | undefined>;
  update: (
    command: IPostUpdateCommand,
    oldPost: IPost,
    currentUser: IUser
  ) => Promise<IPost | null | undefined>;

  delete: (postId: string) => Promise<any>;
  deleteUsersPosts: (usersIds: string[]) => Promise<any>;
}

export default IPostRepository;
