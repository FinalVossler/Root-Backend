import {
  IPostCreateCommand,
  IPostUpdateCommand,
  IPostsGetCommand,
  IPostsSearchCommand,
} from "roottypes";

import IPost from "./IPost";
import IUser from "../../../user/ports/interfaces/IUser";

interface IPostService {
  create: (command: IPostCreateCommand, currentUser: IUser) => Promise<IPost>;
  getUserPosts: (
    command: IPostsGetCommand,
    currentUser: IUser
  ) => Promise<{ posts: IPost[]; total: number }>;
  search: (
    command: IPostsSearchCommand
  ) => Promise<{ posts: IPost[]; total: number }>;
  getById: (postId: string) => Promise<IPost | null>;
  update: (command: IPostUpdateCommand, currentUser: IUser) => Promise<IPost>;
  delete: (postId: string, currentUser: IUser) => Promise<void>;
  deleteUsersPosts: (usersIds: string[]) => Promise<void>;
}

export default IPostService;
