import mongoose from "mongoose";

import { IFile } from "../../file/file.model";

type UserUpdateProfilePictureCommand = {
  userId: mongoose.Types.ObjectId;
  picture: IFile;
};

export default UserUpdateProfilePictureCommand;
