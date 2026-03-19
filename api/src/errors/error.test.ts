import { describe, expect, it } from "vitest";
import { createError, isApiError } from "./error.js";

describe("createError", () => {
	it("returns defaults when only message is provided", () => {
		const error = createError("Something went wrong");

		expect(error.message).toBe("Something went wrong");
		expect(error.statusCode).toBe(500);
		expect(error.name).toBe("ApiError");
		expect(error.isOperational).toBe(true);
		expect(error.code).toBeUndefined();
		expect(error.details).toBeUndefined();
	});

	it("includes optional code and details when provided", () => {
		const error = createError("Email failed", 500, {
			code: "EMAIL_ERROR",
			details: { provider: "resend" },
		});

		expect(error.message).toBe("Email failed");
		expect(error.statusCode).toBe(500);
		expect(error.code).toBe("EMAIL_ERROR");
		expect(error.details).toEqual({ provider: "resend" });
	});

	it("includes code only when provided and details only when provided", () => {
		const withCodeOnly = createError("Email failed", 500, {
			code: "EMAIL_ERROR",
		});

		expect(withCodeOnly.code).toBe("EMAIL_ERROR");
		expect(withCodeOnly.details).toBeUndefined();

		const withDetailsOnly = createError("Validation failed", 400, {
			details: { field: "email" },
		});

		expect(withDetailsOnly.code).toBeUndefined();
		expect(withDetailsOnly.details).toEqual({ field: "email" });
	});

	it("persists custom name, status code, code, and details", () => {
		const error = createError("Forbidden", 403, {
			name: "AuthorizationError",
			code: "FORBIDDEN",
			details: { action: "delete_recipe" },
		});

		expect(error.message).toBe("Forbidden");
		expect(error.statusCode).toBe(403);
		expect(error.name).toBe("AuthorizationError");
		expect(error.code).toBe("FORBIDDEN");
		expect(error.details).toEqual({ action: "delete_recipe" });
		expect(error.isOperational).toBe(true);
	});
});

describe("isApiError", () => {
	it("accepts a valid ApiError object", () => {
		const err = {
			name: "ApiError",
			message: "Not authorized",
			statusCode: 401,
			isOperational: true,
		};

		expect(isApiError(err)).toBe(true);
	});

	it("rejects null and non-object values", () => {
		expect(isApiError(null)).toBe(false);
		expect(isApiError(undefined)).toBe(false);
		expect(isApiError("string")).toBe(false);
		expect(isApiError(500)).toBe(false);
		expect(isApiError(true)).toBe(false);
	});

	it("rejects values with non-numeric statusCode", () => {
		const err = {
			name: "ApiError",
			message: "Bad status",
			statusCode: "500",
			isOperational: true,
		};

		expect(isApiError(err)).toBe(false);
	});

	it("rejects values with missing or false isOperational", () => {
		const missingOperational = {
			name: "ApiError",
			message: "Missing operational",
			statusCode: 500,
		};

		const falseOperational = {
			name: "ApiError",
			message: "Not operational",
			statusCode: 500,
			isOperational: false,
		};

		expect(isApiError(missingOperational)).toBe(false);
		expect(isApiError(falseOperational)).toBe(false);
	});
});
