import { IPage } from "../page.model";

type PageUpdateCommand = {
  _id: string;
  title: IPage["title"];
  posts: string[];
};

export default PageUpdateCommand;
