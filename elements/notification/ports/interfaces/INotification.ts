import { ITranslatedText, IUserReadDto } from "roottypes";
import { IFile } from "../../../file/file.model";

export default interface INotification {
  _id: string;
  text: ITranslatedText[];
  link: string;
  image?: IFile | string;
  clickedBy: string[];
  to: (IUserReadDto | string)[];

  createdAt: string;
  updatedAt: string;
}
