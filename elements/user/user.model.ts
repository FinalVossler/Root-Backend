import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

import { IFile } from "../file/file.model";
import postRepository from "../post/post.repository";
import fileRepository from "../file/file.repository";
import { IRole } from "../role/role.model";
import Message, { IMessage } from "../message/message.model";
import { SuperRoleEnum } from "roottypes";
import Reaction from "../reaction/reaction.model";
import messageRepository from "../message/message.repository";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  superRole: SuperRoleEnum;
  profilePicture?: IFile | string;
  passwordChangeToken: string;
  role?: IRole | string;
  hasMessagingEmailsActivated?: boolean;
}

export interface IUserWithLastReadMessageInConversation extends IUser {
  lastReadMessageInConversation: IMessage | null;
  to: string[];
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
    superRole: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: SuperRoleEnum.Normal,
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
    await Message.deleteMany({ from: new mongoose.Types.ObjectId(user?._id) });
    await Reaction.deleteMany({ user: new mongoose.Types.ObjectId(user?._id) });
  }

  next();
});

const User = mongoose.model<IUser, IUserModel>("user", UserSchema);

export default User;
