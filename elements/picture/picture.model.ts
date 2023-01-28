import mongoose from "mongoose";

export interface IPicture {
  _id?: mongoose.ObjectId;
  url: string;
  uuid: string;
}

interface PictureModel extends mongoose.Model<IPicture> {}

const PictureSchema = new mongoose.Schema<IPicture>(
  {
    url: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    uuid: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPicture, PictureModel>("picture", PictureSchema);
