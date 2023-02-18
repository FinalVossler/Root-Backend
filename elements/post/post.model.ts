import mongoose from "mongoose";

import File, { IFile } from "../file/file.model";
import User from "../user/user.model";

export enum PostVisibility {
  Private = "Private",
  Public = "Public",
  Connections = "Connections",
}

export enum PostDesign {
  Default = "Default",
  Card = "Card",
  TitleAndText = "TitleAndText",
  Banner = "Banner",
}

export interface IPost {
  _id: mongoose.ObjectId;
  title?: string;
  posterId: mongoose.ObjectId;
  content?: string;
  files: IFile[];
  visibility: PostVisibility;
  design: PostDesign;

  createdAt: string;
  updatedAt: string;
}

interface IPostModel extends mongoose.Model<IPost> {}

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.SchemaTypes.String,
    },
    posterId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: User.name,
      required: true,
    },
    content: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    files: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        ref: File.modelName,
        default: [],
      },
    ],
    visibility: {
      type: mongoose.SchemaTypes.String,
      default: PostVisibility.Public,
    },
    design: {
      type: mongoose.SchemaTypes.String,
      default: PostDesign.Default,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost, IPostModel>("post", PostSchema);
