import {
  EntityEventNotificationTriggerEnum,
  INotificationCreateCommand,
} from "roottypes";
import emailService from "../email/email.service";
import { IEntity } from "../entity/entity.model";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import { ITranslatedText } from "../ITranslatedText";
import notificationService from "../notification/notification.service";
import { IRole } from "../role/role.model";
import roleService from "../role/role.service";
import { IUser } from "../user/user.model";
import userService from "../user/user.service";
import { IEntityEventNotification } from "./entityEventNotification.model";
import { IFile } from "../file/file.model";
import { IModel } from "../model/model.model";

const entityEventNotificationService = {
  notifyUsers: async (
    modelId: string,
    trigger: EntityEventNotificationTriggerEnum,
    entity: IEntity,
    currentUser: IUser,
    usersIdsToNotify?: string[]
  ): Promise<void> => {
    const roles: IRole[] =
      await roleService.getRolesWithEntityPermissionsForModel(modelId);

    for (let i = 0; i < roles.length; i++) {
      const emails: {
        subject: string;
        text: string;
        // Used for the in app notification text
        notificationText: ITranslatedText[];
        // Used for the in app notification link
        link: string;
        forRole: IRole;
      }[] = [];

      const role: IRole = roles[i];
      role.entityPermissions.forEach((entityPermission: IEntityPermission) => {
        if ((entityPermission.model as IModel)._id.toString() !== modelId) {
          return;
        }

        entityPermission.entityEventNotifications.forEach(
          (entityEventNotification: IEntityEventNotification) => {
            if (entityEventNotification.trigger !== trigger) {
              return;
            }

            const languages: string[] = [];
            entityEventNotification.title.forEach(
              (translatedText: ITranslatedText) => {
                if (languages.indexOf(translatedText.language) === -1) {
                  languages.push(translatedText.language);
                }
              }
            );

            entityEventNotification.text.forEach(
              (translatedText: ITranslatedText) => {
                if (languages.indexOf(translatedText.language) === -1) {
                  languages.push(translatedText.language);
                }
              }
            );

            const subject: string = languages
              .map((language) => {
                return entityEventNotification.title.find(
                  (el) => el.language === language
                )?.text;
              })
              .join(" | ");

            const content: string = languages
              .map((language) => {
                return entityEventNotification.text.find(
                  (el) => el.language === language
                )?.text;
              })
              .join("<br>");

            const link =
              process.env.ORIGIN + "/entities/" + modelId + "/" + entity._id;

            const text =
              "<div>" +
              content +
              '<br><br> <a target="_blank" href="' +
              link +
              '">' +
              link +
              "</a>" +
              "<div>";

            emails.push({
              subject,
              text,
              notificationText: entityEventNotification.title.map(
                (translatedText) => ({
                  language: translatedText.language,
                  text:
                    currentUser.firstName +
                    " " +
                    currentUser.lastName +
                    ": " +
                    translatedText.text,
                })
              ),
              forRole: role,
              link,
            });
          }
        );
      });

      let allUsersToNotifiy: IUser[] = [];

      if (usersIdsToNotify) {
        allUsersToNotifiy = await userService.getByIds(usersIdsToNotify);
      } else {
        allUsersToNotifiy = await userService.getRoleUsers(role._id.toString());
      }

      emails.forEach((email) => {
        const usersToNotifyForThisEmail: IUser[] = allUsersToNotifiy.filter(
          (u) =>
            (u.role as IRole)?._id.toString() === email.forRole._id.toString()
        );

        // Create the in app notification
        const notificationCreateCommand: INotificationCreateCommand = {
          imageId: (currentUser.profilePicture as IFile)?._id?.toString() || "",
          link: email.link,
          toIds: usersToNotifyForThisEmail.map((user) => user._id.toString()),
          text: email.notificationText,
        };

        notificationService.create(notificationCreateCommand);

        usersToNotifyForThisEmail.forEach((user) => {
          emailService.sendEmail({
            to: user.email,
            subject: email.subject,
            text: email.text,
          });
        });
      });
    }
  },
};

export default entityEventNotificationService;
