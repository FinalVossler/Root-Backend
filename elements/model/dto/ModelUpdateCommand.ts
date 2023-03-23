type ModelUpdateCommand = {
  _id: string;
  name: string;
  modelFields: {
    fieldId: string;
    required: string;
  }[];
  language: string;
};

export default ModelUpdateCommand;
