const express = require("express");
const cors = require("cors");
import { config as dotenvConfig } from "dotenv";

import mongoose from "./mongoose";
import router from "./router";
import errorMiddleware from "./middleware/errorMiddleware";
import loggerMiddleware from "./middleware/loggerMiddleware";

const app = express();
dotenvConfig();

mongoose();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(router);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("app is running on port " + PORT);
});
