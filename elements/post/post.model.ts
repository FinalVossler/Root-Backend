import mongoose from "mongoose";
import File, { IFile } from "../file/file.model";
import User from "../user/user.model";

export interface IPost {
  title?: string;
  poster: mongoose.ObjectId;
  content?: string;
  files: IFile[];

  createdAt: string;
  updatedAt: string;
}

interface IPostModel extends mongoose.Model<IPost> {}

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.SchemaTypes.String,
    },
    poster: {
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
        ref: File.name,
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost, IPostModel>("post", PostSchema);
