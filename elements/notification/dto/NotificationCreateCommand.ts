import { ITranslatedText } from "../../ITranslatedText";
import { INotification } from "../notification.model";

type NotificationCreateCommand = {
  text: ITranslatedText[];
  link: INotification["link"];
  imageId: string;
  toIds: string[];
};

export default NotificationCreateCommand;
