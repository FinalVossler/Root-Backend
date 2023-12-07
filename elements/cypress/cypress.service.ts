import Entity from "../entity/entity.model";
import Field from "../field/field.model";
import Message from "../message/message.model";
import Page from "../page/page.model";
import Post from "../post/post.model";
import User, { IUser } from "../user/user.model";
import File from "../file/file.model";
import EntityEventNotification from "../entityEventNotification/entityEventNotification.model";
import EntityPermission from "../entityPermission/entityPermission.model";
import FieldTableElement from "../fieldTableElement/fieldTableElement.model";
import Model from "../model/model.model";
import Role from "../role/role.model";
import ModelState from "../modelState/modelState.model";
import Notification from "../notification/notification.model";
import Reaction from "../reaction/reaction.model";
import Socket from "../socket/socket.model";

const cypressService = {
  prepare: async (currentUser: IUser) => {
    await Socket.deleteMany({});

    await File.deleteMany({
      $id: { $ne: currentUser.profilePicture?._id?.toString() },
    });

    await Reaction.deleteMany({});
    await Message.deleteMany({});

    await User.deleteMany({ _id: { $ne: currentUser._id.toString() } });

    await Page.deleteMany({});
    await Post.deleteMany({});

    await Role.deleteMany({});
    await Entity.deleteMany({});
    await EntityPermission.deleteMany({});
    await EntityEventNotification.deleteMany({});

    await Model.deleteMany({});
    await ModelState.deleteMany({});
    await Field.deleteMany({});
    await FieldTableElement.deleteMany({});

    await Notification.deleteMany({});
  },
};

export default cypressService;
