import mongoose from "mongoose";

import UserUpdateProfilePictureCommand from "./dtos/UserUpdateProfilePictureCommand";
import UserRegisterCommand from "./dtos/UserRegisterCommand";
import UserUpdateCommand from "./dtos/UserUpdateCommand";
import fileRepository from "../file/file.repository";

import User, { IUser } from "./user.model";
import { IFile } from "../file/file.model";
import UserCreateCommand from "./dtos/UserCreateCommand";
import UsersGetCommand from "./dtos/UsersGetCommand";
import UsersSearchCommand from "./dtos/UsersSearchCommand";
import ChatGetContactsCommand from "./dtos/ChatGetContactsCommand";
import UserSearchByRoleCommand from "./dtos/UserSearchByRoleCommand";

const userRepository = {
  chatGetContacts: async (
    command: ChatGetContactsCommand,
    currentUser: IUser
  ): Promise<{ users: IUser[]; total: number }> => {
    const users = await User.find({
      _id: { $nin: [currentUser._id] },
    })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await User.find({
      _id: { $nin: [currentUser._id] },
    }).count();

    return { users, total };
  },
  save: async (command: UserRegisterCommand): Promise<IUser> => {
    const user: IUser = (await User.create(command)) as IUser;

    return user;
  },
  getById: async (id: string): Promise<IUser> => {
    const user: IUser = (await User.findById(
      new mongoose.Types.ObjectId(id)
    ).populate(populationOptions)) as IUser;

    return user;
  },
  getContactsByIds: async (usersIds: string[]): Promise<IUser[]> => {
    const users: IUser[] = (await User.find({
      _id: { $in: [usersIds.map((id) => new mongoose.Types.ObjectId(id))] },
    }).populate(populationOptions)) as IUser[];

    return users;
  },
  getByEmail: async (email: string): Promise<IUser> => {
    const user: IUser = (await User.findOne({ email })
      .populate(populationOptions)
      .exec()) as IUser;

    return user;
  },
  deleteByEmail: async (email: string) => {
    await User.deleteOne({ email }).exec();
  },
  update: async (command: UserUpdateCommand): Promise<IUser> => {
    await User.updateOne(
      { _id: command._id },
      {
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
        role: command.roleId,
      }
    ).exec();

    const user: IUser = await userRepository.getById(command._id.toString());

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

    const user: IUser = (await userRepository.getById(
      command.userId.toString()
    )) as IUser;

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
  create: async (command: UserCreateCommand): Promise<IUser> => {
    const user: IUser = await User.create({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      password: command.password,
      role: command.roleId,
    });

    return await userRepository.getById(user._id.toString());
  },
  getUsers: async (
    command: UsersGetCommand
  ): Promise<{ total: number; users: IUser[] }> => {
    const findQuery = command.roleId
      ? { role: new mongoose.Types.ObjectId(command.roleId) }
      : {};
    const users: IUser[] = await User.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await User.find(findQuery).count();

    return { users, total };
  },
  getByIds: async (usersIds: string[]): Promise<IUser[]> => {
    const users: IUser[] = await User.find({
      _id: { $in: usersIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .populate(populationOptions)
      .exec();

    return users;
  },
  deleteUsers: async (usersIds: mongoose.ObjectId[]): Promise<void> => {
    for (let i = 0; i < usersIds.length; i++) {
      await User.deleteOne({ _id: usersIds[i] });
    }

    return null;
  },
  search: async (
    command: UsersSearchCommand,
    additionalConditions: any = {}
  ): Promise<{ users: IUser[]; total: number }> => {
    const query = User.find({
      $or: [
        { firstName: { $regex: command.firstNameOrLastNameOrEmail } },
        { lastName: { $regex: command.firstNameOrLastNameOrEmail } },
        { email: { $regex: command.firstNameOrLastNameOrEmail } },
      ],
      ...additionalConditions,
    });

    const users: IUser[] = await query
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .populate(populationOptions);

    const total = await User.find({
      $or: [
        { firstName: { $regex: command.firstNameOrLastNameOrEmail } },
        { lastName: { $regex: command.firstNameOrLastNameOrEmail } },
      ],
    }).count();

    return { users, total };
  },
  getRoleUsers: async (roleId: string): Promise<IUser[]> => {
    const users: IUser[] = await User.find({
      role: { _id: new mongoose.Types.ObjectId(roleId) },
    }).exec();

    return users;
  },
  searchByRole: async (
    command: UserSearchByRoleCommand
  ): Promise<{ users: IUser[]; total: number }> => {
    const { users, total } = await userRepository.search(
      command.searchCommand,
      {
        role: new mongoose.Types.ObjectId(command.roleId),
      }
    );

    return { users, total };
  },
};

const populationOptions = [
  {
    path: "profilePicture",
    model: "file",
  },
  {
    path: "role",
    model: "role",
    populate: {
      path: "entityPermissions",
      model: "entityPermission",
      populate: [
        {
          path: "model",
          model: "model",
        },
        {
          path: "entityFieldPermissions",
          populate: {
            path: "field",
            model: "field",
          },
        },
        {
          path: "entityUserAssignmentPermissionsByRole",
          populate: {
            path: "otherRoles",
            model: "role",
          },
        },
      ],
    },
  },
];

export default userRepository;
