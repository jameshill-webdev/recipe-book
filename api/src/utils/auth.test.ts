import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@recipe-book/shared/lib/constants";

const { betterAuthMock, prismaAdapterMock, sendEmailMock, prismaMock, adapterToken } = vi.hoisted(
	() => ({
		betterAuthMock: vi.fn(),
		prismaAdapterMock: vi.fn(),
		sendEmailMock: vi.fn(),
		prismaMock: { __tag: "prisma-client" },
		adapterToken: { __tag: "adapter-token" },
	}),
);

vi.mock("better-auth", () => ({
	betterAuth: betterAuthMock,
}));

vi.mock("better-auth/adapters/prisma", () => ({
	prismaAdapter: prismaAdapterMock,
}));

vi.mock("@/database/prisma.js", () => ({
	default: prismaMock,
}));

vi.mock("./email.js", () => ({
	sendEmail: sendEmailMock,
}));

const loadAuthConfig = async () => {
	await import("./auth.js");
	return betterAuthMock.mock.calls.at(-1)?.[0];
};

describe("auth", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();

		process.env.BETTER_AUTH_URL = "https://api.example.test";
		process.env.BETTER_AUTH_SECRET = "test-secret";
		process.env.UI_ORIGIN = "https://ui.example.test";

		prismaAdapterMock.mockReturnValue(adapterToken);
		betterAuthMock.mockImplementation((config) => ({ __config: config }));
		sendEmailMock.mockResolvedValue(undefined);
	});

	it("Auth config includes expected core options (database adapter, baseURL, secret, trustedOrigins)", async () => {
		const authConfig = await loadAuthConfig();

		expect(prismaAdapterMock).toHaveBeenCalledWith(prismaMock, {
			provider: "postgresql",
		});
		expect(authConfig.database).toBe(adapterToken);
		expect(authConfig.baseURL).toBe("https://api.example.test");
		expect(authConfig.secret).toBe("test-secret");
		expect(authConfig.trustedOrigins).toEqual(["https://ui.example.test"]);
	});

	it("Password length values are wired from shared constants", async () => {
		const authConfig = await loadAuthConfig();

		expect(authConfig.emailAndPassword.minPasswordLength).toBe(MINIMUM_PASSWORD_LENGTH);
		expect(authConfig.emailAndPassword.maxPasswordLength).toBe(MAXIMUM_PASSWORD_LENGTH);
	});

	it("sendResetPassword callback invokes sendEmail with reset URL content", async () => {
		const authConfig = await loadAuthConfig();
		const resetUrl = "https://ui.example.test/reset?token=abc";

		await authConfig.emailAndPassword.sendResetPassword({
			user: { email: "user@example.com" },
			url: resetUrl,
		});

		expect(sendEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "user@example.com",
				subject: "Recipe book app: reset your password",
				html: expect.stringContaining(resetUrl),
			}),
		);
	});

	it("sendVerificationEmail callback invokes sendEmail with verification URL content", async () => {
		const authConfig = await loadAuthConfig();
		const verificationUrl = "https://ui.example.test/verify?token=xyz";

		await authConfig.emailVerification.sendVerificationEmail({
			user: { email: "verify@example.com" },
			url: verificationUrl,
		});

		expect(sendEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "verify@example.com",
				subject: "Recipe book app: verify your email address",
				html: expect.stringContaining(verificationUrl),
			}),
		);
	});

	it("Callback error paths are caught and logged (no unhandled rejection)", async () => {
		const authConfig = await loadAuthConfig();
		const resetError = new Error("reset send failed");
		const verificationError = new Error("verification send failed");
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		sendEmailMock.mockRejectedValueOnce(resetError).mockRejectedValueOnce(verificationError);

		await expect(
			authConfig.emailAndPassword.sendResetPassword({
				user: { email: "user@example.com" },
				url: "https://ui.example.test/reset?token=abc",
			}),
		).resolves.toBeUndefined();

		await expect(
			authConfig.emailVerification.sendVerificationEmail({
				user: { email: "verify@example.com" },
				url: "https://ui.example.test/verify?token=xyz",
			}),
		).resolves.toBeUndefined();

		await Promise.resolve();

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Failed to send reset password email:",
			resetError,
		);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Failed to send verification email:",
			verificationError,
		);
	});

	it("Email send is intentionally non-awaited (void pattern) to avoid timing leakage in auth flow", async () => {
		const authConfig = await loadAuthConfig();
		sendEmailMock.mockReturnValueOnce(new Promise<void>(() => {}));

		await expect(
			authConfig.emailAndPassword.sendResetPassword({
				user: { email: "user@example.com" },
				url: "https://ui.example.test/reset?token=abc",
			}),
		).resolves.toBeUndefined();

		expect(sendEmailMock).toHaveBeenCalledTimes(1);
	});
});
