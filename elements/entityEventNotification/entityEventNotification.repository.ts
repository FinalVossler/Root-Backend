import mongoose from "mongoose";
import getNewTranslatedTextsForUpdate from "../../utils/getNewTranslatedTextsForUpdate";
import EntityEventNotification, {
  IEntityEventNotification,
} from "./entityEventNotification.model";
import {
  IEntityEventNotificationCreateCommand,
  IEntityEventNotificationUpdateCommand,
} from "roottypes";

const entityEventNotificationRepository = {
  create: async (
    command: IEntityEventNotificationCreateCommand
  ): Promise<IEntityEventNotification> => {
    const entityEventNotification: IEntityEventNotification =
      await EntityEventNotification.create({
        text: [{ language: command.language, text: command.text }],
        title: [{ language: command.language, text: command.title }],
        trigger: command.trigger,
      });

    return entityEventNotification;
  },
  update: async (
    command: IEntityEventNotificationUpdateCommand,
    oldEntityEventNotification: IEntityEventNotification
  ): Promise<IEntityEventNotification> => {
    if (!command._id) {
      throw new Error("upating an event notification with no idea");
    }

    await EntityEventNotification.updateOne(
      { _id: command._id },
      {
        $set: {
          title: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.title,
            oldValue: oldEntityEventNotification.title,
          }),
          text: getNewTranslatedTextsForUpdate({
            language: command.language,
            newText: command.text,
            oldValue: oldEntityEventNotification.text,
          }),
          trigger: command.trigger,
        },
      }
    ).exec();

    const entityEventNotification: IEntityEventNotification | null =
      await EntityEventNotification.findById(command._id);

    if (!entityEventNotification) {
      throw new Error("entity event notification not found");
    }

    return entityEventNotification;
  },
  deleteByIds: async (ids: string[]): Promise<void> => {
    await EntityEventNotification.deleteMany({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
};

export default entityEventNotificationRepository;
