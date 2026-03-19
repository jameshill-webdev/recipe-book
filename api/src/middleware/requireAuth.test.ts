import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextFunction } from "express";

vi.mock("better-auth/node", () => ({
	fromNodeHeaders: vi.fn(),
}));

vi.mock("@/utils/auth.js", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/utils/auth.js";
import { requireAuth } from "./requireAuth.js";
import { makeResponse, makeRequest } from "../test/mocks.js";

describe("requireAuth", () => {
	const mockedFromNodeHeaders = vi.mocked(fromNodeHeaders);
	const mockedGetSession = vi.mocked(auth.api.getSession);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("Valid session from auth.api.getSession sets req.session and calls next", async () => {
		const headers = { authorization: "Bearer valid-token" };
		const req = makeRequest({ headers });
		const next = vi.fn() as NextFunction;
		const { res } = makeResponse();
		const normalizedHeaders = { authorization: "Bearer valid-token" };
		const validSession = {
			user: {
				id: "user_123",
				email: "user@example.com",
			},
			session: {
				id: "sess_123",
				userId: "user_123",
			},
		} as NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

		mockedFromNodeHeaders.mockReturnValue(normalizedHeaders as never);
		mockedGetSession.mockResolvedValue(validSession);

		await requireAuth(req, res, next);

		expect(req.session).toEqual(validSession);
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("Null session returns 401 with Unauthorized payload and does not call next", async () => {
		const headers = { authorization: "Bearer missing-session" };
		const req = makeRequest({ headers });
		const next = vi.fn() as NextFunction;
		const { res, status, json } = makeResponse();

		mockedFromNodeHeaders.mockReturnValue(headers as never);
		mockedGetSession.mockResolvedValue(null);

		await requireAuth(req, res, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
		expect(next).not.toHaveBeenCalled();
	});

	it("Null session returns 401 with Unauthorized payload and does not call next", async () => {
		const headers = { authorization: "Bearer missing-session" };
		const req = makeRequest({ headers });
		const next = vi.fn() as NextFunction;
		const { res, status, json } = makeResponse();

		mockedFromNodeHeaders.mockReturnValue(headers as never);
		mockedGetSession.mockResolvedValue(null);

		await requireAuth(req, res, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
		expect(next).not.toHaveBeenCalled();
	});

	it("fromNodeHeaders called with request headers", async () => {
		const headers = { authorization: "Bearer valid-token", "x-request-id": "req_123" };
		const req = makeRequest({ headers });
		const next = vi.fn() as NextFunction;
		const { res } = makeResponse();
		const normalizedHeaders = { authorization: "Bearer valid-token" };

		mockedFromNodeHeaders.mockReturnValue(normalizedHeaders as never);
		mockedGetSession.mockResolvedValue({
			user: { id: "user_123", email: "user@example.com" },
			session: { id: "sess_123", userId: "user_123" },
		} as NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>);

		await requireAuth(req, res, next);

		expect(mockedFromNodeHeaders).toHaveBeenCalledWith(headers);
		expect(mockedGetSession).toHaveBeenCalledWith({ headers: normalizedHeaders });
	});

	it("Session assignment preserves expected session object shape", async () => {
		const headers = { authorization: "Bearer valid-token" };
		const req = makeRequest({ headers });
		const next = vi.fn() as NextFunction;
		const { res } = makeResponse();
		const validSession = {
			user: {
				id: "user_abc",
				email: "user@example.com",
				name: "Shape Test",
			},
			session: {
				id: "sess_abc",
				userId: "user_abc",
				token: "token_abc",
			},
		} as NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

		mockedFromNodeHeaders.mockReturnValue(headers as never);
		mockedGetSession.mockResolvedValue(validSession);

		await requireAuth(req, res, next);

		expect(req.session).toMatchObject({
			user: {
				id: "user_abc",
				email: "user@example.com",
				name: "Shape Test",
			},
			session: {
				id: "sess_abc",
				userId: "user_abc",
				token: "token_abc",
			},
		});
	});
});
