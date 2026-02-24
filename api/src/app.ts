import express, { type Express, type Request, type Response } from "express";
import appRouter from "./app.router.js";

export function initialiseApp(): Express {
  const app = express();

  app.use(express.json());

  app.use("/", appRouter);

  return app;
}
