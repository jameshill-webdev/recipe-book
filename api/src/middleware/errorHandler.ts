import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { createError, isApiError } from "../errors/error.js";
import type { ApiError, ApiErrorResponse } from "../errors/types.js";

function apiErrorToResponseBody(apiError: ApiError): ApiErrorResponse {
	return {
		success: false,
		message: apiError.message,
		...(apiError.code !== undefined ? { code: apiError.code } : {}),
		...(apiError.details !== undefined ? { details: apiError.details } : {}),
	};
}

export function errorHandler(err: unknown, req: Request, res: Response) {
	const isProd = process.env.NODE_ENV === "production";

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			const apiError = createError("Unique constraint failed", 409, {
				code: "UNIQUE_CONSTRAINT",
				details: isProd ? undefined : { meta: err.meta },
			});
			return res.status(apiError.statusCode).json(apiErrorToResponseBody(apiError));
		}

		if (err.code === "P2025") {
			const apiError = createError("Resource not found", 404, { code: "RESOURCE_NOT_FOUND" });
			return res.status(apiError.statusCode).json(apiErrorToResponseBody(apiError));
		}
	}

	if (isApiError(err)) {
		return res.status(err.statusCode).json(apiErrorToResponseBody(err));
	}

	console.error(err);

	const apiError = createError("Internal server error", 500, { code: "INTERNAL_ERROR" });

	return res.status(apiError.statusCode).json(apiErrorToResponseBody(apiError));
}
