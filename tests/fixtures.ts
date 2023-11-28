import mongoose from "mongoose";

import { IUser, SuperRole } from "../elements/user/user.model";

export const adminUser: IUser = {
  firstName: "Hamza",
  lastName: "Khalifa",
  _id: new mongoose.Types.ObjectId("640bf999128f95fd4cffa409"),
  email: "hamza.khalifa@esprit.tn",
  superRole: SuperRole.SuperAdmin,
  profilePicture: {
    isImage: true,
    url: "",
    uuid: "",
  },
  password: "",
  passwordChangeToken: "",
};
