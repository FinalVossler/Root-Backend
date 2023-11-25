import express from "express";
import cors from "cors";
import { config as dotenvConfig } from "dotenv";
import http from "http";
import cluster from "node:cluster";
import os from "node:os";

import mongoose from "./mongoose";
import router from "./router";
import errorMiddleware from "./middleware/errorMiddleware";
import socket from "./socket";

const MAX_CPUS = 1;

const setupWorker = () => {
  const app = express();
  dotenvConfig();

  mongoose();

  app.use(cors());

  app.use(express.json());

  app.use(router);

  app.use(errorMiddleware);

  const PORT = process.env.PORT || 5000;
  const server: http.Server = app.listen(PORT, () => {
    console.info("app is running on port " + PORT);
  });

  socket(server);
};

setupWorker();

// const numberOfCpus = Math.min(MAX_CPUS, os.cpus().length);

// if (cluster.isPrimary) {
//   for (let i = 0; i < numberOfCpus; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", () => {
//     cluster.fork();
//   });
// } else {
//   setupWorker();
// }
