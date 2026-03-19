import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { createError } from "../errors/error.js";
import { errorHandler } from "./errorHandler.js";

function makePrismaError(code: string, meta?: Record<string, unknown>) {
	return new Prisma.PrismaClientKnownRequestError("prisma error", {
		code,
		clientVersion: "0.0.0",
		...(meta !== undefined && { meta }),
	});
}

function makeRes() {
	const json = vi.fn();
	const statusReturn = { json };
	const status = vi.fn<() => typeof statusReturn>().mockReturnValue(statusReturn);
	return { res: { status } as unknown as Response, status, json };
}

const req = {} as Request;

describe("errorHandler", () => {
	describe("Prisma known request errors", () => {
		it("maps P2002 to 409 with UNIQUE_CONSTRAINT code", () => {
			const { res, status, json } = makeRes();
			errorHandler(makePrismaError("P2002"), req, res);

			expect(status).toHaveBeenCalledWith(409);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({ success: false, code: "UNIQUE_CONSTRAINT" }),
			);
		});

		it("maps P2025 to 404 with RESOURCE_NOT_FOUND code", () => {
			const { res, status, json } = makeRes();
			errorHandler(makePrismaError("P2025"), req, res);

			expect(status).toHaveBeenCalledWith(404);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({ success: false, code: "RESOURCE_NOT_FOUND" }),
			);
		});

		it("includes Prisma meta in details for P2002 in non-production", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			const { res, json } = makeRes();
			errorHandler(makePrismaError("P2002", { target: ["email"] }), req, res);

			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					details: { meta: { target: ["email"] } },
				}),
			);

			process.env.NODE_ENV = originalEnv;
		});

		it("omits details for P2002 in production", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const { res, json } = makeRes();
			errorHandler(makePrismaError("P2002", { target: ["email"] }), req, res);

			const body = json.mock.calls[0]![0];
			expect(body).not.toHaveProperty("details");

			process.env.NODE_ENV = originalEnv;
		});
	});

	describe("ApiError", () => {
		it("returns the ApiError's own status code and mapped response body", () => {
			const { res, status, json } = makeRes();
			const apiError = createError("Forbidden", 403, { code: "FORBIDDEN" });

			errorHandler(apiError, req, res);

			expect(status).toHaveBeenCalledWith(403);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: "Forbidden",
					code: "FORBIDDEN",
				}),
			);
		});
	});

	describe("unknown errors", () => {
		beforeEach(() => {
			vi.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("maps unknown errors to 500 INTERNAL_ERROR", () => {
			const { res, status, json } = makeRes();
			errorHandler(new Error("boom"), req, res);

			expect(status).toHaveBeenCalledWith(500);
			expect(json).toHaveBeenCalledWith(
				expect.objectContaining({ success: false, code: "INTERNAL_ERROR" }),
			);
		});

		it("logs unexpected errors to the console", () => {
			const { res } = makeRes();
			const boom = new Error("boom");
			errorHandler(boom, req, res);

			expect(console.error).toHaveBeenCalledWith(boom);
		});
	});

	describe("response body shape", () => {
		it("always includes success: false and message", () => {
			const { res, json } = makeRes();
			errorHandler(makePrismaError("P2025"), req, res);

			const body = json.mock.calls[0]![0];
			expect(body.success).toBe(false);
			expect(typeof body.message).toBe("string");
		});

		it("omits code and details keys when not present", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			// A plain unknown error produces INTERNAL_ERROR with no details
			const { res, json } = makeRes();
			errorHandler(new Error("oops"), req, res);

			const body = json.mock.calls[0]![0];
			expect(body).toHaveProperty("code"); // INTERNAL_ERROR is set
			expect(body).not.toHaveProperty("details");
		});

		it("includes code when the ApiError has one", () => {
			const { res, json } = makeRes();
			const apiError = createError("Not found", 404, { code: "RESOURCE_NOT_FOUND" });
			errorHandler(apiError, req, res);

			expect(json.mock.calls[0]![0]).toHaveProperty("code", "RESOURCE_NOT_FOUND");
		});

		it("includes details when the ApiError has them", () => {
			const { res, json } = makeRes();
			const apiError = createError("Bad input", 422, {
				code: "VALIDATION_ERROR",
				details: { fields: ["name"] },
			});
			errorHandler(apiError, req, res);

			expect(json.mock.calls[0]![0]).toHaveProperty("details", { fields: ["name"] });
		});

		it("omits details key entirely when not set on an ApiError", () => {
			const { res, json } = makeRes();
			const apiError = createError("Unauthorized", 401, { code: "UNAUTHORIZED" });
			errorHandler(apiError, req, res);

			expect(json.mock.calls[0]![0]).not.toHaveProperty("details");
		});
	});
});
