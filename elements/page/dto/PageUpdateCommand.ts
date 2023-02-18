import { IPage } from "../page.model";

type PageUpdateCommand = {
  _id: string;
  title: IPage["title"];
  orderedPosts: string[];
};

export default PageUpdateCommand;
