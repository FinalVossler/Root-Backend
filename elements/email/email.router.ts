import express from "express";
import emailController from "./email.controller";

const router = express.Router();

const { createEmail } = emailController;

router.post("/", createEmail);

export default router;
