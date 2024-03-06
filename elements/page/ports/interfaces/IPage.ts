import { ITranslatedText } from "roottypes";

import IPost from "../../../post/ports/interfaces/IPost";

export default interface IPage {
  _id: string;
  title: ITranslatedText[];
  slug: string;
  posts: (IPost | string)[];
  showInHeader?: boolean;
  showInSideMenu?: boolean;
}
