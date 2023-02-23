import mongoose from "mongoose";
import slugify from "slugify";

import postModel, { IPost } from "../post/post.model";

export interface IPage {
  title: string;
  slug: string;
  posts: IPost[];
}

interface IPageModel extends mongoose.Model<IPage> {}

const PageSchema = new mongoose.Schema<IPage>({
  title: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  slug: {
    type: mongoose.SchemaTypes.String,
  },
  posts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      default: [],
      ref: postModel.modelName,
    },
  ],
});

PageSchema.pre(
  "save",
  function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    this.slug = slugify(this.title);

    next();
  }
);

export default mongoose.model<IPage, IPageModel>("page", PageSchema);
