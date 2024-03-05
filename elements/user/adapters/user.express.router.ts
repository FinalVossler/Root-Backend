import express from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import userExpressController from "./user.express.controller";

const {
  getChatContacts,
  getUsersWithTheirLastReadMessagesInConversation,
  updateProfilePicture,
  sendChangePasswordRequest,
  changePassword,
  verifyPasswordToken,
  forgotPasswordChangePassword,
} = userExpressController;

const router = express.Router();

router.post("/getChatContacts", protectMiddleware, getChatContacts);
router.post("/getContactsByIds", userExpressController.getContactsById);
router.get("/getUser", userExpressController.getUser);
router.post(
  "/getUsersWithTheirLastReadMessagesInConversation",
  protectMiddleware,
  getUsersWithTheirLastReadMessagesInConversation
);
router.get("/me", protectMiddleware, userExpressController.me);
router.post("/register", userExpressController.register);
router.post("/login", userExpressController.login);
router.put("/", protectMiddleware, userExpressController.updateUser);
router.put("/updateProfilePicture", protectMiddleware, updateProfilePicture);
router.post("/sendChangePasswordRequest", sendChangePasswordRequest);
router.post("/changePassword", protectMiddleware, changePassword);
router.post("/forgotPasswordChangePassword", forgotPasswordChangePassword);
router.post("/verifyPasswordToken", protectMiddleware, verifyPasswordToken);
router.post("/", protectMiddleware, userExpressController.createUser);
router.post("/getUsers", protectMiddleware, userExpressController.getUsers);
router.delete("/", protectMiddleware, userExpressController.deleteUsers);
router.post("/search", userExpressController.searchUsers);
router.post("/searchByRole", userExpressController.searchUsersByRole);

export default router;
