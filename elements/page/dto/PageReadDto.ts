import { IPage } from "../page.model";

type PageReadDto = {
  _id: IPage["_id"];
  title: IPage["title"];
  slug: IPage["slug"];
  posts: IPage["posts"];
};

export const toReadDto = (page: IPage): PageReadDto => {
  return {
    _id: page._id,
    title: page.title,
    slug: page.slug,
    posts: page.posts,
  };
};

export default PageReadDto;
