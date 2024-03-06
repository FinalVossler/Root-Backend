import express from "express";

import emailExpressController from "./email.express.controller";

const router = express.Router();

const { createEmail } = emailExpressController;

router.post("/", createEmail);

export default router;
