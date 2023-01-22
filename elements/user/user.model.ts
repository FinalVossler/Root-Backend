import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

export enum Role {
  Admin = "Admin",
}

export interface IUser {
  _id: mongoose.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

interface UserModel extends mongoose.Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>(
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
      default: Role.Admin,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const salt: string = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

export default mongoose.model<IUser, UserModel>("user", userSchema);
