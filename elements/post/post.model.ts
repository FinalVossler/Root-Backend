import mongoose from "mongoose";

import { IFile } from "../file/file.model";
import TranslatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { PostDesignEnum, PostVisibilityEnum } from "roottypes";
import { IUser } from "../user/user.model";

export interface IPost {
  _id: string;
  title?: ITranslatedText[];
  subTitle?: ITranslatedText[];
  poster: IUser | string;
  content?: ITranslatedText[];
  files: (IFile | string)[];
  visibility: PostVisibilityEnum;
  design: PostDesignEnum;
  children: (IPost | string)[];
  code?: string;

  createdAt: string;
  updatedAt: string;
}

interface IPostModel extends mongoose.Model<IPost> {}

const PostSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: TranslatedTextSchema,
      required: false,
    },
    subTitle: {
      type: TranslatedTextSchema,
      required: false,
    },
    code: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    poster: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: TranslatedTextSchema,
      required: true,
    },
    files: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        ref: "file",
        default: [],
      },
    ],
    visibility: {
      type: mongoose.SchemaTypes.String,
      default: PostVisibilityEnum.Public,
    },
    design: {
      type: mongoose.SchemaTypes.String,
      default: PostDesignEnum.Default,
    },
    children: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "post",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model<IPost, IPostModel>("post", PostSchema);

export default Post;
