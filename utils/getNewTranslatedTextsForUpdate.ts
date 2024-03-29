import { ITranslatedText } from "roottypes";

const getNewTranslatedTextsForUpdate = (options: {
  oldValue: ITranslatedText[] | undefined;
  language: string;
  newText: string;
}): ITranslatedText[] => {
  const { oldValue, language, newText } = options;

  if (!oldValue) {
    return [{ text: newText, language }];
  }
  const translatedText: ITranslatedText | undefined = oldValue.find(
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
