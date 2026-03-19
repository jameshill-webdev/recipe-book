import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("pg", () => ({
	Pool: vi.fn(),
}));

vi.mock("@prisma/adapter-pg", () => ({
	PrismaPg: vi.fn(),
}));

vi.mock("../generated/prisma/client.js", () => ({
	PrismaClient: vi.fn(),
}));

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const TEST_DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

// clearMocks: true (vitest.config.ts) resets mock state before each test,
// so constructor call data is captured once in beforeAll and stored here.
let firstPoolArg: ConstructorParameters<typeof Pool>[0];
let poolInstance: InstanceType<typeof Pool>;
let prismaPgArg: InstanceType<typeof Pool>;
let adapterInstance: InstanceType<typeof PrismaPg>;
let prismaClientArgs: ConstructorParameters<typeof PrismaClient>[0];

describe("prisma", () => {
	beforeAll(async () => {
		process.env.DATABASE_URL = TEST_DATABASE_URL;
		await import("./prisma.js");

		firstPoolArg = vi.mocked(Pool).mock.calls[0]![0];
		poolInstance = vi.mocked(Pool).mock.instances[0]!;
		prismaPgArg = vi.mocked(PrismaPg).mock.calls[0]![0] as InstanceType<typeof Pool>;
		adapterInstance = vi.mocked(PrismaPg).mock.instances[0]!;
		prismaClientArgs = vi.mocked(PrismaClient).mock.calls[0]![0];
	});

	describe("Pool config", () => {
		it("is constructed with correct config values", () => {
			expect(firstPoolArg).toEqual({
				connectionString: TEST_DATABASE_URL,
				max: 5,
				idleTimeoutMillis: 30_000,
				connectionTimeoutMillis: 10_000,
				keepAlive: true,
			});
		});
	});

	describe("Connection string", () => {
		it("is wired from DATABASE_URL environment variable", () => {
			expect(firstPoolArg).toMatchObject({ connectionString: TEST_DATABASE_URL });
		});
	});

	describe("PrismaPg adapter", () => {
		it("is constructed with the Pool instance", () => {
			expect(prismaPgArg).toBe(poolInstance);
		});

		it("is passed to PrismaClient", () => {
			expect(prismaClientArgs).toEqual({ adapter: adapterInstance });
		});
	});
});
