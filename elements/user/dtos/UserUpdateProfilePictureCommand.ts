import mongoose from "mongoose";

import { IPicture } from "../../picture/picture.model";

type UserUpdateProfilePictureCommand = {
  userId: mongoose.ObjectId;
  picture: IPicture;
};

export default UserUpdateProfilePictureCommand;
