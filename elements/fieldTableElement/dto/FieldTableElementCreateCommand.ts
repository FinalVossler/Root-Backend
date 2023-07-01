import { ITranslatedText } from "../../ITranslatedText";

type FieldTableElementCreateCommand = {
  name: string | ITranslatedText[];
  language: string;
};

export default FieldTableElementCreateCommand;
