import express from "express";
import cors from "cors";
import { config as dotenvConfig } from "dotenv";
import http from "http";

import mongoose from "./mongoose";
import router from "./router";
import errorMiddleware from "./middleware/errorMiddleware";
import { socketService } from "./ioc";

const app = express();
dotenvConfig();

mongoose();

app.use(cors());

app.use(express.json());

app.use(router);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Tests will automatically run on Port 0 by supertest:
// Port 0 tells Unix to "Choose the first randomly available port that you find."
if (process.env.NODE_ENV !== "test") {
  const server: http.Server = app.listen(PORT, () => {
    console.info("app is running on port " + PORT);
  });

  socketService.socketInit(server);
}

export default app;
