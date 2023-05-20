import emailService from "../email/email.service";
import { IEntity } from "../entity/entity.model";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import { ITranslatedText } from "../ITranslatedText";
import { IRole } from "../role/role.model";
import roleService from "../role/role.service";
import { IUser } from "../user/user.model";
import userService from "../user/user.service";
import {
  EntityEventNotificationTrigger,
  IEntityEventNotification,
} from "./entityEventNotification.model";

const entityEventNotificationService = {
  notifyUsers: async (
    modelId: string,
    trigger: EntityEventNotificationTrigger,
    entity: IEntity
  ): Promise<void> => {
    const roles: IRole[] =
      await roleService.getRolesWithEntityPermissionsForModel(modelId);

    for (let i = 0; i < roles.length; i++) {
      const emails: {
        subject: string;
        text: string;
        trigger: EntityEventNotificationTrigger;
      }[] = [];

      const role: IRole = roles[i];
      role.entityPermissions.forEach((entityPermission: IEntityPermission) => {
        entityPermission.entityEventNotifications.forEach(
          (entityEventNotification: IEntityEventNotification) => {
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
                ).text;
              })
              .join(" | ");

            const content: string = languages
              .map((language) => {
                return entityEventNotification.text.find(
                  (el) => el.language === language
                ).text;
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
              trigger: entityEventNotification.trigger,
            });
          }
        );
      });

      const usersToNotify: IUser[] = await userService.getRoleUsers(
        role._id.toString()
      );

      usersToNotify.forEach((user) => {
        emails.forEach((email) => {
          if (email.trigger === trigger) {
            emailService.sendEmail({
              to: user.email,
              subject: email.subject,
              text: email.text,
            });
          }
        });
      });
    }
  },
};

export default entityEventNotificationService;
