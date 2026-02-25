import type { Request, Response, NextFunction } from "express";
import { createError } from "../errors/error.js";

export function notFound(request: Request, response: Response, next: NextFunction) {
	next(
		createError(`Route not found: ${request.method} ${request.originalUrl}`, 404, {
			code: "ROUTE_NOT_FOUND",
		}),
	);
}
