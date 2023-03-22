type ModelCreateCommand = {
  name: string;
  modelFields: {
    field: string;
    required: boolean;
  }[];
  language: string;
};

export default ModelCreateCommand;
