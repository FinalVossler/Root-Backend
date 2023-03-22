type ModelUpdateCommand = {
  _id: string;
  name: string;
  modelFields: {
    field: string;
    required: string;
  }[];
  language: string;
};

export default ModelUpdateCommand;
