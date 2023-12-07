import mongoose from "mongoose";

import { IUser, SuperRole } from "../elements/user/user.model";
import { FieldType, IField } from "../elements/field/field.model";
import ModelCreateCommand from "../elements/model/dto/ModelCreateCommand";
import { ModelStateType } from "../elements/modelState/modelState.model";

export const adminUser: IUser = {
  firstName: "Hamza",
  lastName: "Khalifa",
  _id: new mongoose.Types.ObjectId("640bf999128f95fd4cffa409"),
  email: "hk.kh@gmail.tn",
  superRole: SuperRole.SuperAdmin,
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
  type: FieldType.Text,
});

export const createCreateModelCommand = (
  modelName: string,
  fields: IField[]
): ModelCreateCommand => ({
  language: "en",
  modelEvents: [],
  modelFields: fields.map((field) => ({
    fieldId: field?._id.toString() || "",
    mainField: true,
    required: false,
    modelStatesIds: [],
  })),
  name: modelName,
  states: [
    {
      exclusive: false,
      language: "en",
      name: "state 1",
      stateType: ModelStateType.ParentState,
    },
  ],
  subStates: [
    {
      exclusive: false,
      language: "en",
      name: "sub state 1",
      stateType: ModelStateType.SubState,
    },
  ],
});
