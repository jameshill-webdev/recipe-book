import { describe, expect, it } from "vitest";
import { createError } from "./error.js";

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
});
