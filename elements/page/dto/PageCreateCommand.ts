import { IPage } from "../../page/page.model";

type PageCreateCommand = {
  title: IPage["title"];
  posts: string[];
};

export default PageCreateCommand;
