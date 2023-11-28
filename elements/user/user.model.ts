import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

import { IFile } from "../file/file.model";
import postRepository from "../post/post.repository";
import fileRepository from "../file/file.repository";
import { IRole } from "../role/role.model";
import { IMessage } from "../message/message.model";
import messageRepository from "../message/message.repository";

export enum SuperRole {
  SuperAdmin = "SuperAdmin",
  Normal = "Normal",
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  superRole: SuperRole;
  profilePicture: IFile;
  passwordChangeToken: string;
  role?: IRole;
  hasMessagingEmailsActivated?: boolean;
}

export type UserWithLastReadMessageInConversation = IUser & {
  lastReadMessageInConversation: IMessage | null;
  to: string[];
};

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
    superRole: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: SuperRole.Normal,
    },
    profilePicture: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "file",
      required: false,
      default: null,
    },
    passwordChangeToken: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    role: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "role",
      required: false,
    },
    hasMessagingEmailsActivated: {
      type: mongoose.SchemaTypes.Boolean,
      default: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index(
  { firstName: "text", lastName: "text", email: "text" },
  { background: true }
);

UserSchema.pre("save", async function (next) {
  const salt: string = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

UserSchema.pre("deleteOne", async function (next) {
  const user: IUser = (await this.model.findOne(this.getQuery())) as IUser;

  if (user?._id) {
    await postRepository.deleteUserPosts(user._id.toString());
    await fileRepository.deleteUserFiles(user._id.toString());
  }

  next();
});

export default mongoose.model<IUser, IUserModel>("user", UserSchema);
