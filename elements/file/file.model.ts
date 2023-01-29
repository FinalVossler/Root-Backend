import mongoose from "mongoose";

export interface IFile {
  _id?: mongoose.ObjectId;
  url: string;
  uuid: string;
  isImage: boolean;
}

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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFile, IFileModel>("file", FileSchema);
