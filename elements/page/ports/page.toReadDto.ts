import { IPageReadDto } from "roottypes";
import { postToReadDto } from "../../post/ports/post.toReadDto";
import IPage from "./interfaces/IPage";

export const pageToReadDto = (page: IPage): IPageReadDto => {
  return {
    _id: page._id.toString(),
    title: page.title,
    slug: page.slug,
    posts: page.posts.map((p) => postToReadDto(p)),
    showInHeader: Boolean(page.showInHeader),
    showInSideMenu: Boolean(page.showInSideMenu),
  };
};
