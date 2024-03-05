import mongoose from "mongoose";
import slugify from "slugify";
import Post from "../../post/adapters/post.mongoose.model";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IPage from "../ports/interfaces/IPage";

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

const Page = mongoose.model<IPage, IPageModel>("page", PageSchema);

export default Page;
