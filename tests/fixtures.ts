import {
  FieldTypeEnum,
  IModelCreateCommand,
  ModelStateTypeEnum,
  SuperRoleEnum,
} from "roottypes";
import { IField } from "../elements/field/ports/interfaces/IField";
import IUser from "../elements/user/ports/interfaces/IUser";

export const adminUser: IUser = {
  firstName: "Hamza",
  lastName: "Khalifa",
  _id: "640bf999128f95fd4cffa409",
  email: "hk.kh.pro@gmail.com",
  superRole: SuperRoleEnum.SuperAdmin,
  profilePicture: {
    isImage: true,
    url: "",
    uuid: "",
  },
  password: "",
  passwordChangeToken: "",
};

export const createCreateFieldCommand = (fieldName) => ({
  canChooseFromExistingFiles: false,
  fieldEvents: [],
  language: "en",
  name: fieldName,
  tableOptions: {
    name: "",
    columns: [],
    rows: [],
    yearTable: false,
  },
  type: FieldTypeEnum.Text,
});

export const createCreateModelCommand = (
  modelName: string,
  fields: IField[]
): IModelCreateCommand => ({
  language: "en",
  modelEvents: [],
  modelFields: fields.map((field) => ({
    fieldId: field?._id.toString() || "",
    mainField: true,
    stickInTable: false,
    required: false,
    modelStatesIds: [],
  })),
  name: modelName,
  states: [
    {
      exclusive: false,
      language: "en",
      name: "state 1",
      stateType: ModelStateTypeEnum.ParentState,
    },
  ],
  subStates: [
    {
      exclusive: false,
      language: "en",
      name: "sub state 1",
      stateType: ModelStateTypeEnum.SubState,
    },
  ],
});
