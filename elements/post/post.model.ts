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
  Spacing = "Spacing",
  Card = "Card",
  TitleAndText = "TitleAndText",
  Banner = "Banner",
  TitleImageAndText = "TitleImageAndText",
  ChildrenContainer = "ChildrenContainer",
  RotatingCarzd = "RotatingCard",
}

export interface IPost {
  _id: mongoose.ObjectId;
  title?: string;
  posterId: mongoose.ObjectId;
  content?: string;
  files: IFile[];
  visibility: PostVisibility;
  design: PostDesign;
  children: IPost[];

  createdAt: string;
  updatedAt: string;
}

interface IPostModel extends mongoose.Model<IPost> {}

const postSchema = new mongoose.Schema<IPost>(
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

const model = mongoose.model<IPost, IPostModel>("post", postSchema);

export default model;
