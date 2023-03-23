type ModelCreateCommand = {
  name: string;
  modelFields: {
    fieldId: string;
    required: boolean;
  }[];
  language: string;
};

export default ModelCreateCommand;
