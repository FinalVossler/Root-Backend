import express from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import userController from "./user.controller";

const {
  getChatContacts,
  getUsersWithTheirLastReadMessagesInConversation,
  updateProfilePicture,
  sendChangePasswordRequest,
  changePassword,
  verifyPasswordToken,
  forgotPasswordChangePassword,
} = userController;

const router = express.Router();

router.post("/getChatContacts", protectMiddleware, getChatContacts);
router.post("/getContactsByIds", userController.getContactsById);
router.get("/getUser", userController.getUser);
router.post(
  "/getUsersWithTheirLastReadMessagesInConversation",
  protectMiddleware,
  getUsersWithTheirLastReadMessagesInConversation
);
router.get("/me", protectMiddleware, userController.me);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/", protectMiddleware, userController.updateUser);
router.put("/updateProfilePicture", protectMiddleware, updateProfilePicture);
router.post("/sendChangePasswordRequest", sendChangePasswordRequest);
router.post("/changePassword", protectMiddleware, changePassword);
router.post("/forgotPasswordChangePassword", forgotPasswordChangePassword);
router.post("/verifyPasswordToken", protectMiddleware, verifyPasswordToken);
router.post("/", protectMiddleware, userController.createUser);
router.post("/getUsers", protectMiddleware, userController.getUsers);
router.delete("/", protectMiddleware, userController.deleteUsers);
router.post("/search", userController.searchUsers);
router.post("/searchByRole", userController.searchUsersByRole);

export default router;
