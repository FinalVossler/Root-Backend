import createNodeMailerSendEmailService from "./elements/email/adapters/email.nodemailer.service";
import createEmailService from "./elements/email/ports/email.service";
import IEmailService from "./elements/email/ports/interfaces/IEmailService";
import entityMongooseRepository from "./elements/entity/adapters/entity.mongoose.repository";
import createEntityService from "./elements/entity/ports/entity.service";
import IEntityService from "./elements/entity/ports/interfaces/IEntityService";
import createEntityEventNotificationService from "./elements/entityEventNotification/ports/entityEventNotification.service";
import IEntityEventNotificationService from "./elements/entityEventNotification/ports/interfaces/IEntityEventNotificationService";
import entityPermissionMongooseRepository from "./elements/entityPermission/adapters/entityPermission.mongoose.repository";
import createEntityPermissionService from "./elements/entityPermission/ports/entityPermission.service";
import IEntityPermissionService from "./elements/entityPermission/ports/interfaces/IEntityPermissionService";
import fieldMongooseRepository from "./elements/field/adapters/field.mongoose.repository";
import createFieldService from "./elements/field/ports/field.service";
import IFieldService from "./elements/field/ports/interfaces/IFieldService";
import fieldTableElementRepository from "./elements/fieldTableElement/adapters/fieldTableElement.mongoose.repository";
import fileMongooseRepository from "./elements/file/adapters/file.mongoose.repository";
import createFileService from "./elements/file/ports/file.service";
import IFileService from "./elements/file/ports/interfaces/IFileService";
import messageMongooseRepository from "./elements/message/adapters/message.mongoose.repository";
import IMessageService from "./elements/message/ports/interfaces/IMessageService";
import createMessageService from "./elements/message/ports/message.service";
import microFrontendMongooseRepository from "./elements/microFontend/adapters/microFrontend.mongoose.respository";
import IMicroFrontendService from "./elements/microFontend/ports/interfaces/IMicroFrontendService";
import createMicroFrontendService from "./elements/microFontend/ports/microFrontend.service";
import modelMongooseRepository from "./elements/model/adapters/model.mongoose.repository";
import IModelService from "./elements/model/ports/interfaces/IModelService";
import createModelService from "./elements/model/ports/model.service";
import modelStateMongooseRepository from "./elements/modelState/adapters/modelState.mongoose.repository";
import notificationMongooseRepository from "./elements/notification/adapters/notification.mongoose.repository";
import INotificationService from "./elements/notification/ports/interfaces/INotificationService";
import createNotificationService from "./elements/notification/ports/notification.service";
import pageMongooseRepository from "./elements/page/adapters/page.mongoose.repository";
import IPageService from "./elements/page/ports/interfaces/IPageService";
import createPageService from "./elements/page/ports/page.service";
import postMongooseRepository from "./elements/post/adapters/post.mongoose.repository";
import IPostService from "./elements/post/ports/interfaces/IPostService";
import createPostService from "./elements/post/ports/post.service";
import reactionMongooseRepository from "./elements/reaction/adapters/reaction.mongoose.repository";
import IReactionService from "./elements/reaction/ports/interfaces/IReactionService";
import createReactionService from "./elements/reaction/ports/reaction.service";
import roleMongooseRepository from "./elements/role/adapters/role.mongoose.repository";
import IRoleService from "./elements/role/ports/interfaces/IRoleService";
import createRoleService from "./elements/role/ports/role.service";
import socketMongooseRepository from "./elements/socket/adapters/socket.mongoose.repository";
import createSocketService from "./elements/socket/ports/socket.service";
import ITestsPreparationService from "./elements/testsPreparation/ports/interfaces/ITestsPreparationService";
import createTestsPreparationService from "./elements/testsPreparation/ports/testsPreparation.service";
import userMongooseRepository from "./elements/user/adapters/user.mongoose.repository";
import IUserService from "./elements/user/ports/interfaces/IUserService";
import createUserService from "./elements/user/ports/user.service";
import websiteConfigurationMongooseRepository from "./elements/websiteConfiguration/adapters/websiteConfiguration.mongoose.repository";
import createWebsiteConfigurationService from "./elements/websiteConfiguration/ports/websiteConfiguration.service";

export const websiteConfigurationService = createWebsiteConfigurationService(
  websiteConfigurationMongooseRepository
);
export const fileService: IFileService = createFileService(
  fileMongooseRepository
);
export const entityPermissionService: IEntityPermissionService =
  createEntityPermissionService(entityPermissionMongooseRepository);
export const roleService: IRoleService = createRoleService(
  roleMongooseRepository,
  entityPermissionService
);
export const postService: IPostService = createPostService(
  postMongooseRepository
);
export const pageService: IPageService = createPageService(
  pageMongooseRepository,
  roleService
);

export const emailService: IEmailService = createEmailService(
  createNodeMailerSendEmailService,
  websiteConfigurationMongooseRepository
);

export const socketService = createSocketService(
  websiteConfigurationService,
  emailService,
  socketMongooseRepository
);

export const messageService: IMessageService = createMessageService(
  messageMongooseRepository,
  socketService
);
export const userService: IUserService = createUserService(
  roleService,
  userMongooseRepository,
  messageService,
  emailService
);

export const fieldService: IFieldService = createFieldService(
  fieldMongooseRepository,
  roleService,
  modelMongooseRepository,
  fieldTableElementRepository
);
export const modelService: IModelService = createModelService(
  roleService,
  modelMongooseRepository,
  entityPermissionService,
  entityPermissionMongooseRepository,
  modelStateMongooseRepository,
  entityMongooseRepository
);
export const notificationService: INotificationService =
  createNotificationService(notificationMongooseRepository, socketService);

export const entityEventNotificationService: IEntityEventNotificationService =
  createEntityEventNotificationService(
    userService,
    notificationService,
    emailService,
    roleService
  );

export const entityService: IEntityService = createEntityService(
  roleService,
  entityMongooseRepository,
  modelService,
  userService,
  entityEventNotificationService
);

export const microFrontendService: IMicroFrontendService =
  createMicroFrontendService(roleService, microFrontendMongooseRepository);

export const testsPreparationService: ITestsPreparationService =
  createTestsPreparationService(fieldMongooseRepository);
export const reactionService: IReactionService = createReactionService(
  reactionMongooseRepository,
  messageService,
  socketService
);
