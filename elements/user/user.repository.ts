import { ObjectId } from "mongoose";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import UserUpdateCommand from "./dtos/UserUpdateCommand";

import User, { IUser } from "./user.model";

const userRepository = {
  get: async (currentUserId?: ObjectId): Promise<IUser[]> => {
    const users: IUser[] = (await User.find({
      _id: { $nin: [currentUserId] },
    })) as IUser[];

    return users;
  },
  save: async (command: UserRegisterCommand): Promise<IUser> => {
    const user: IUser = (await User.create(command)) as IUser;

    return user;
  },
  getbyId: async (id: ObjectId): Promise<IUser> => {
    const user: IUser = (await User.findById(id)) as IUser;

    return user;
  },
  getByEmail: async (email: string): Promise<IUser> => {
    const user: IUser = (await User.findOne({ email }).exec()) as IUser;

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
};

export default userRepository;
