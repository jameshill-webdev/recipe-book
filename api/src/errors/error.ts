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
	const errAsAny = err as any;
	return (
		typeof err === "object" &&
		err !== null &&
		errAsAny.isOperational === true &&
		typeof errAsAny.statusCode === "number" &&
		typeof errAsAny.message === "string"
	);
}
