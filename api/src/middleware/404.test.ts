import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Response } from "express";
import { notFound } from "./404.js";
import type { ApiError } from "@/errors/types.js";
import { makeRequest } from "../test/mocks.js";

function getNextError(next: ReturnType<typeof vi.fn>): ApiError {
	return next.mock.calls[0]?.[0] as ApiError;
}

describe("notFound", () => {
	it("calls next with created error", () => {
		const req = makeRequest({ method: "GET", originalUrl: "/missing" });
		const res = {} as Response;
		const next = vi.fn();

		notFound(req, res, next as unknown as NextFunction);

		expect(next).toHaveBeenCalledTimes(1);
		const error = getNextError(next);
		expect(error).toMatchObject({
			statusCode: 404,
			code: "ROUTE_NOT_FOUND",
		});
	});

	it("message includes method and originalUrl", () => {
		const req = makeRequest({ method: "PATCH", originalUrl: "/recipes/42/publish" });
		const res = {} as Response;
		const next = vi.fn();

		notFound(req, res, next as unknown as NextFunction);

		const error = getNextError(next);
		expect(error?.message).toContain("PATCH");
		expect(error?.message).toContain("/recipes/42/publish");
	});

	it.each([
		["GET", "/__not_found_test__/alpha"],
		["POST", "/__not_found_test__/beta/123"],
		["DELETE", "/__not_found_test__/deep/path"],
	])(
		"for several different method/URL inputs, the notFound middleware always passes an error with the expected properties to next (%s %s)",
		(method, url) => {
			const req = makeRequest({ method, originalUrl: url });
			const res = {} as Response;
			const next = vi.fn();

			notFound(req, res, next as unknown as NextFunction);

			const error = getNextError(next);
			expect(error).toMatchObject({
				statusCode: 404,
				code: "ROUTE_NOT_FOUND",
			});
			expect(error?.message).toContain(`${method} ${url}`);
		},
	);
});
