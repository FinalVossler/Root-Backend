import mongoose from "mongoose";

import { PostDesignEnum, PostVisibilityEnum } from "roottypes";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IPost from "../ports/interfaces/IPost";

interface IPostModel extends mongoose.Model<IPost> {}

const PostSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: translatedTextSchema,
      required: false,
    },
    subTitle: {
      type: translatedTextSchema,
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
      type: translatedTextSchema,
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
