import { ObjectId } from "mongoose";

import UserUpdateProfilePictureCommand from "./dtos/UserUpdateProfilePictureCommand";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import fileRepository from "../file/file.repository";

import User, { IUser } from "./user.model";
import { IFile } from "../file/file.model";
import UserChangePasswordCommand from "./dtos/UserChangePasswordCommand";

const userRepository = {
  get: async (currentUserId?: ObjectId): Promise<IUser[]> => {
    const users: IUser[] = (await User.find({
      _id: { $nin: [currentUserId] },
    }).populate("profilePicture")) as IUser[];

    return users;
  },
  save: async (command: UserRegisterCommand): Promise<IUser> => {
    const user: IUser = (await User.create(command)) as IUser;

    return user;
  },
  getbyId: async (id: ObjectId): Promise<IUser> => {
    const user: IUser = (await User.findById(id).populate(
      "profilePicture"
    )) as IUser;

    return user;
  },
  getByEmail: async (email: string): Promise<IUser> => {
    const user: IUser = (await User.findOne({ email })
      .populate("profilePicture")
      .exec()) as IUser;

    return user;
  },
  deleteByEmail: async (email: string) => {
    await User.deleteOne({ email }).exec();
  },
  update: async (command: UserUpdateCommand): Promise<IUser> => {
    await User.updateOne(
      { _id: command._id },
      { firstName: command.firstName, lastName: command.lastName }
    ).exec();

    const user: IUser = await userRepository.getbyId(command._id);

    return user;
  },
  updateProfilePicture: async (
    command: UserUpdateProfilePictureCommand,
    currentUser: IUser
  ): Promise<IUser> => {
    let picture: IFile = null;

    if (!command.picture._id) {
      picture = await fileRepository.create(command.picture, currentUser);
    }

    await User.updateOne(
      { _id: command.userId },
      { $set: { profilePicture: picture ? picture._id : command.picture } }
    );

    const user: IUser = (await userRepository.getbyId(command.userId)) as IUser;

    return user;
  },
  setPasswordChangeToken: async (
    token: string,
    currentUser: IUser
  ): Promise<void> => {
    await User.updateOne(
      { _id: currentUser._id },
      { $set: { passwordChangeToken: token } }
    );
  },
  changePassword: async (
    newPasswordHash: string,
    currentUser: IUser
  ): Promise<void> => {
    await User.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          password: newPasswordHash,
        },
      }
    );
  },
};

export default userRepository;
