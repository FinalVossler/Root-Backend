import mongoose from "mongoose";
import EntityPermissionCreateCommand from "./dto/EntityPermissionCreateCommand";
import EntityPermission, { IEntityPermission } from "./entityPermission.model";

const entityPermissionRepository = {
  create: async (
    command: EntityPermissionCreateCommand
  ): Promise<IEntityPermission> => {
    const entityPermission: IEntityPermission = await EntityPermission.create(
      command
    );

    return entityPermission;
  },
  deleteByIds: async (ids: string[]): Promise<void> => {
    await EntityPermission.deleteMany({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
};

export default entityPermissionRepository;
