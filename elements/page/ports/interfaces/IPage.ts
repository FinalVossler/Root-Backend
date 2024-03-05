import { ITranslatedText } from "roottypes";
import { IPost } from "../../../post/adapters/post.mongoose.model";

export default interface IPage {
  _id: string;
  title: ITranslatedText[];
  slug: string;
  posts: (IPost | string)[];
  showInHeader?: boolean;
  showInSideMenu?: boolean;
}
