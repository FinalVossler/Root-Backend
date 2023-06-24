import { IPage } from "../page.model";

type PageReadDto = {
  _id: IPage["_id"];
  title: IPage["title"];
  slug: IPage["slug"];
  posts: IPage["posts"];
  showInHeader: IPage["showInHeader"];
  showInSideMenu: IPage["showInSideMenu"];
};

export const toReadDto = (page: IPage): PageReadDto => {
  return {
    _id: page._id,
    title: page.title,
    slug: page.slug,
    posts: page.posts,
    showInHeader: page.showInHeader,
    showInSideMenu: page.showInSideMenu,
  };
};

export default PageReadDto;
