import { vi } from "vitest";
import type { Request, Response } from "express";

export function makeResponse() {
	const json = vi.fn();
	const statusReturn = { json };
	const status = vi.fn<() => typeof statusReturn>().mockReturnValue(statusReturn);

	return { res: { status } as unknown as Response, status, json };
}

export function makeRequest(overrides: Partial<Request> = {}): Request {
	return { ...overrides } as Request;
}
