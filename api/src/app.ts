import express, { type Express, type Request, type Response } from "express";

export function initialiseApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, message: "Hello recipe book API" });
  });

  return app;
}
