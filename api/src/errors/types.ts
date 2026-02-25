import type { ApiErrorCode } from "./errorCodes.js";

export interface ApiError {
	name: string;
	message: string;
	statusCode: number;
	code?: ApiErrorCode;
	details?: unknown;
	isOperational: true;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	code?: ApiErrorCode;
	details?: unknown;
}
