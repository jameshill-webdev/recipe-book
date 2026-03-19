import { vi } from "vitest";
import type { Request, Response } from "express";

export function makeRes() {
	const json = vi.fn();
	const statusReturn = { json };
	const status = vi.fn<() => typeof statusReturn>().mockReturnValue(statusReturn);

	return { res: { status } as unknown as Response, status, json };
}

export function makeReq(headers: Record<string, string>): Request {
	return { headers } as unknown as Request;
}
