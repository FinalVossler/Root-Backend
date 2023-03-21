import FieldCreateCommand from "./dto/FieldCreateCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import { IField } from "./field.model";
import Field from "./field.model";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import mongoose from "mongoose";

const fieldRepository = {
  create: async (command: FieldCreateCommand): Promise<IField> => {
    const field: IField = await Field.create({
      name: [{ language: command.language, text: command.name }],
      type: command.type,
    });

    return field;
  },
  update: async (command: FieldUpdateCommand): Promise<IField> => {
    const field: IField = await Field.findById(command._id);

    await Field.updateOne(
      { _id: command._id },
      {
        $set: {
          name: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.name,
            oldValue: field.name,
          }),
          type: command.type,
        },
      }
    );

    const newField: IField = await Field.findById(command._id);

    return newField;
  },
  getFields: async (
    command: FieldsGetCommand
  ): Promise<{ total: number; fields: IField[] }> => {
    const fields: IField[] = await Field.find({})
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .exec();

    const total: number = await Field.find({}).count();

    return { fields, total };
  },
  deleteFields: async (fieldsIds: mongoose.ObjectId[]): Promise<void> => {
    await Field.deleteMany({ _id: { $in: fieldsIds } });
  },
};

export default fieldRepository;
