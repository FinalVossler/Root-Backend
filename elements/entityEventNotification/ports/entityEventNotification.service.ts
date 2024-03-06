import {
  EntityEventNotificationTriggerEnum,
  INotificationCreateCommand,
  ITranslatedText,
} from "roottypes";

import IEntityEventNotificationService from "./interfaces/IEntityEventNotificationService";
import IEntity from "../../entity/ports/interfaces/IEntity";
import IRole from "../../role/ports/interfaces/IRole";
import IUser from "../../user/ports/interfaces/IUser";
import IEmailService from "../../email/ports/interfaces/IEmailService";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import INotificationService from "../../notification/ports/interfaces/INotificationService";
import IUserService from "../../user/ports/interfaces/IUserService";
import IModel from "../../model/ports/interfaces/IModel";
import IEntityEventNotification from "./interfaces/IEntityEventNotification";
import IFile from "../../file/ports/interfaces/IFile";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";

const createEntityEventNotificationService = (
  userService: IUserService,
  notificationService: INotificationService,
  emailService: IEmailService,
  roleService: IRoleService
): IEntityEventNotificationService => ({
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
});

export default createEntityEventNotificationService;
