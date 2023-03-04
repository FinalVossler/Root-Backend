import mongoose from "mongoose";

import File, { IFile } from "../file/file.model";
import TranslatedTextSchema, { ITranslatedText } from "../ITranslatedText";
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
  AnimatedTitle = "AnimatedTitle",
  UnderlinedTitle = "UnderinedTitle",
  Footer = "Footer",
}

export interface IPost {
  _id: mongoose.ObjectId;
  title?: ITranslatedText[];
  subTitle?: ITranslatedText[];
  posterId: mongoose.ObjectId;
  content?: ITranslatedText[];
  files: IFile[];
  visibility: PostVisibility;
  design: PostDesign;
  children: IPost[];

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
    posterId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: User.name,
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

const model = mongoose.model<IPost, IPostModel>("post", PostSchema);

export default model;
