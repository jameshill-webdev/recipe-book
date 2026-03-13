import express, { type Express } from "express";
import cors from "cors";
import appRouter from "./app.router.js";
import { notFound } from "./middleware/404.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";

export function initialiseApp(): Express {
	const app = express();

	app.use(
		cors({
			origin: process.env.UI_ORIGIN,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE"],
		}),
	);

	app.use("/api/auth", toNodeHandler(auth));

	app.use(express.json());

	app.use("/", appRouter);

	app.use(notFound);
	app.use(errorHandler);

	return app;
}
