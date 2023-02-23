import { IPage } from "../page.model";

type PageReadDto = {
  title: IPage["posts"];
  slug: IPage["slug"];
  posts: IPage["posts"];
};

export default PageReadDto;
