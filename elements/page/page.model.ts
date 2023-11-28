import mongoose from "mongoose";
import slugify from "slugify";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import Post, { IPost } from "../post/post.model";

export interface IPage {
  _id: mongoose.Types.ObjectId;
  title: ITranslatedText[];
  slug: string;
  posts: IPost[];
  showInHeader?: boolean;
  showInSideMenu?: boolean;
}

interface IPageModel extends mongoose.Model<IPage> {}

const PageSchema = new mongoose.Schema<IPage>({
  title: {
    type: translatedTextSchema,
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
      ref: Post.modelName,
    },
  ],
  showInHeader: {
    type: mongoose.SchemaTypes.Boolean,
    required: false,
  },
  showInSideMenu: {
    type: mongoose.SchemaTypes.Boolean,
    required: false,
  },
});

PageSchema.pre(
  "save",
  function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    this.slug = slugify(this.title[0].text);

    next();
  }
);

export default mongoose.model<IPage, IPageModel>("page", PageSchema);
