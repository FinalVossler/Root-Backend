import {
  FieldTypeEnum,
  IModelCreateCommand,
  IUserCreateCommand,
  IUserUpdateCommand,
  ModelStateTypeEnum,
  ModelViewTypeEnum,
  SuperRoleEnum,
} from "roottypes";

import { IField } from "../elements/field/ports/interfaces/IField";
import IUser from "../elements/user/ports/interfaces/IUser";
import adaptBcrypt from "../utils/adaptBcrypt";
import userMongooseRepository from "../elements/user/adapters/user.mongoose.repository";

export const getAdminUser = async (): Promise<IUser> => {
  
  const email: string = 'hk.kh.pro@gmail.com';

  const existingAdminUser = await userMongooseRepository.getByEmail(email)

  const passwordHandler = adaptBcrypt();

  const salt = await passwordHandler.genSalt(10);
  const password = await passwordHandler.hash('rootroot', salt);
  const firstName: string = 'Hamza'
  const lastName: string = 'Khalifa'
  const superRole = SuperRoleEnum.SuperAdmin

  const userCreateCommand: IUserCreateCommand = {
    email,
    firstName,
    lastName,
    password,
    superRole
  }

  if (existingAdminUser) {
    const userUpdateCommand: IUserUpdateCommand=  {
      _id: existingAdminUser._id,
      email,
      firstName,lastName, superRole,
      password
    }
    const updatedUser = await userMongooseRepository.update(userUpdateCommand)
    return updatedUser!
  }
  

  const adminUser = await userMongooseRepository.create(userCreateCommand);

  return adminUser
}

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
  fields: IField[],
  priceFieldId?: string,
  quantityFieldId?: string
): IModelCreateCommand => ({
  isForSale: true,
  language: "en",
  modelEvents: [],
  viewType: ModelViewTypeEnum.LinearView,
  sections: [],
  modelFields: fields.map((field) => ({
    fieldId: field?._id.toString() || "",
    mainField: true,
    stickInTable: false,
    required: false,
    modelStatesIds: [],
    isVariation: false,
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
  isForOrders: false,
  ...(priceFieldId ? { priceFieldId } : {}),
  ...(quantityFieldId ? { quantityFieldId } : {}),
});
