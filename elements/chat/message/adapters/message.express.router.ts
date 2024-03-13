import express from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import messageExpressController from "./message.express.controller";

const {
  createMessage,
  getMessage,
  getConversationTotalUnreadMessages,
  deleteMessage,
  markAllConversationMessagesAsReadByUser,
  getLastConversationsLastMessages,
  getUserTotalUnreadMessages,
} = messageExpressController;
const router = express.Router();

router.post("/", protectMiddleware, createMessage);
router.post("/get", protectMiddleware, getMessage);
router.post(
  "/conversationTotalUnreadMessages",
  protectMiddleware,
  getConversationTotalUnreadMessages
);
router.delete("/", protectMiddleware, deleteMessage);
router.post(
  "/markAllConversationMessagesAsReadByUser",
  protectMiddleware,
  markAllConversationMessagesAsReadByUser
);
router.post(
  "/getLastConversationsLastMessages",
  protectMiddleware,
  getLastConversationsLastMessages
);
router.post(
  "/userTotalUnreadMessages",
  protectMiddleware,
  getUserTotalUnreadMessages
);

export default router;
