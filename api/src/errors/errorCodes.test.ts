import { describe, expect, it } from "vitest";
import * as ErrorCodesModule from "./errorCodes.js";

const { ApiErrorCodes } = ErrorCodesModule;

const knownCodeValues = new Set<string>(Object.values(ApiErrorCodes));
const possibleGuardNames = ["isApiErrorCode", "isKnownApiErrorCode"] as const;

const getExportedGuards = (): Array<(value: unknown) => boolean> => {
	const guards: Array<(value: unknown) => boolean> = [];

	for (const guardName of possibleGuardNames) {
		const candidate = (ErrorCodesModule as Record<string, unknown>)[guardName];

		if (typeof candidate === "function") {
			guards.push(candidate as (value: unknown) => boolean);
		}
	}

	return guards;
};

describe("ApiErrorCodes", () => {
	it("has unique values to avoid accidental duplicates", () => {
		const values = Object.values(ApiErrorCodes);
		expect(new Set(values).size).toBe(values.length);
	});

	it("downstream guards/helpers only accept known codes", () => {
		const isKnownCode = (value: unknown): value is string =>
			typeof value === "string" && knownCodeValues.has(value);

		for (const value of Object.values(ApiErrorCodes)) {
			expect(isKnownCode(value)).toBe(true);
		}

		expect(isKnownCode("NOT_A_REAL_CODE")).toBe(false);
		expect(isKnownCode(500)).toBe(false);
		expect(isKnownCode(null)).toBe(false);

		for (const guard of getExportedGuards()) {
			for (const value of Object.values(ApiErrorCodes)) {
				expect(guard(value)).toBe(true);
			}

			expect(guard("NOT_A_REAL_CODE")).toBe(false);
			expect(guard(500)).toBe(false);
			expect(guard(null)).toBe(false);
		}
	});
});
