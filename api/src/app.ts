import express, { type Express, type Request, type Response } from "express";
import appRouter from "./app.router.js";
import { notFound } from "./middleware/404.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function initialiseApp(): Express {
    const app = express();

    app.use(express.json());

    app.use("/", appRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
