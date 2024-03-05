import { ITranslatedText, PostDesignEnum, PostVisibilityEnum } from "roottypes";
import IUser from "../../../user/ports/interfaces/IUser";
import IFile from "../../../file/ports/interfaces/IFile";

export default interface IPost {
  _id: string;
  title?: ITranslatedText[];
  subTitle?: ITranslatedText[];
  poster: IUser | string;
  content?: ITranslatedText[];
  files: (IFile | string)[];
  visibility: PostVisibilityEnum;
  design: PostDesignEnum;
  children: (IPost | string)[];
  code?: string;

  createdAt: string;
  updatedAt: string;
}
