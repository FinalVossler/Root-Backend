import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

import postMongooseRepository from "../../post/adapters/post.mongoose.repository";
import fileRepository from "../../file/adapters/file.mongoose.repository";
import Message from "../../message/adapters/message.mongoose.model";
import { SuperRoleEnum } from "roottypes";
import Reaction from "../../reaction/adapters/reaction.mongoose.model";
import IUser from "../ports/interfaces/IUser";

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
    await postMongooseRepository.deleteUserPosts(user._id.toString());
    await fileRepository.deleteUserFiles(user._id.toString());
    await Message.deleteMany({ from: new mongoose.Types.ObjectId(user?._id) });
    await Reaction.deleteMany({ user: new mongoose.Types.ObjectId(user?._id) });
  }

  next();
});

const User = mongoose.model<IUser, IUserModel>("user", UserSchema);

export default User;