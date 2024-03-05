import mongoose from "mongoose";
import IFile from "../ports/interfaces/IFile";

interface IFileModel extends mongoose.Model<IFile> {}

const FileSchema = new mongoose.Schema<IFile>(
  {
    url: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    uuid: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    isImage: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
      default: true,
    },
    name: {
      type: mongoose.SchemaTypes.String,
      required: true,
      defaut: "",
    },
    ownerId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model<IFile, IFileModel>("file", FileSchema);

export default File;
