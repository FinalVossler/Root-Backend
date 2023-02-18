import { IPage } from "../../page/page.model";

type PageCreateCommand = {
  title: IPage["title"];
  orderedPosts: string[];
};

export default PageCreateCommand;
