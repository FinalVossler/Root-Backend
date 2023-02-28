import { ITranslatedText } from "../elements/ITranslatedText";

const getNewTranslatedTextsForUpdate = (options: {
  oldValue: ITranslatedText[] | undefined;
  language: string;
  newText: string;
}): ITranslatedText[] => {
  const { oldValue, language, newText } = options;

  if (!oldValue) {
    return [{ text: newText, language }];
  }
  const translatedText: ITranslatedText = oldValue.find(
    (el) => el.language === language
  );
  if (translatedText) {
    translatedText.text = newText;
    return oldValue;
  } else {
    return [...oldValue, { text: newText, language }];
  }
};

export default getNewTranslatedTextsForUpdate;
