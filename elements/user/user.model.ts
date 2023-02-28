import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

import File, { IFile } from "../file/file.model";

export enum Role {
  Admin = "Admin",
  Normal = "Normal",
}

export interface IUser {
  _id: mongoose.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  profilePicture: IFile;
}

interface IUserModel extends mongoose.Model<IUser> {}

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    lastName: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    email: {
      type: mongoose.SchemaTypes.String,
      required: [true, "Please provide an email"],
      unique: true,
      match:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    },
    password: {
      type: mongoose.SchemaTypes.String,
      required: [true, "Please provide a password"],
    },
    role: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: Role.Normal,
    },
    profilePicture: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: File.modelName,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const salt: string = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

export default mongoose.model<IUser, IUserModel>("user", UserSchema);
