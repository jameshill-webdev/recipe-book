import type { ApiError } from "./types.js";
import type { ApiErrorCode } from "./errorCodes.js";

export function createError(
	message: string,
	statusCode = 500,
	options?: { code?: ApiErrorCode; details?: unknown; name?: string },
): ApiError {
	return {
		name: options?.name ?? "ApiError",
		message,
		statusCode,
		...(options?.code ? { code: options.code } : {}),
		...(options?.details ? { details: options.details } : {}),
		isOperational: true,
	};
}

export function isApiError(err: unknown): err is ApiError {
	return (
		typeof err === "object" &&
		err !== null &&
		"isOperational" in err &&
		err.isOperational === true &&
		"statusCode" in err &&
		typeof err.statusCode === "number" &&
		"message" in err &&
		typeof err.message === "string"
	);
}
