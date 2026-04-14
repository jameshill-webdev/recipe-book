import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const processEnv = (
	globalThis as typeof globalThis & {
		process?: { env: Record<string, string | undefined> };
	}
).process?.env;

if (processEnv) {
	processEnv.DEBUG_PRINT_LIMIT = "3000";
}

afterEach(() => {
	cleanup();
});
