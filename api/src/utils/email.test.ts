import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
	sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
	Resend: class {
		emails = {
			send: sendMock,
		};
	},
}));

import { sendEmail } from "./email.js";

const testData = {
	resend: {
		from: "noreply@example.com",
	},
	user: {
		email: "user@example.com",
	},
};

describe("sendEmail", () => {
	const originalNodeEnv = process.env.NODE_ENV;
	const originalFrom = process.env.RESEND_FROM;
	const originalApiKey = process.env.RESEND_API_KEY;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.NODE_ENV = "test";
		process.env.RESEND_FROM = testData.resend.from;
		process.env.RESEND_API_KEY = "test-api-key";
		sendMock.mockResolvedValue({ error: null });
	});

	afterAll(() => {
		process.env.NODE_ENV = originalNodeEnv;
		if (originalFrom === undefined) {
			delete process.env.RESEND_FROM;
		} else {
			process.env.RESEND_FROM = originalFrom;
		}
		if (originalApiKey === undefined) {
			delete process.env.RESEND_API_KEY;
		} else {
			process.env.RESEND_API_KEY = originalApiKey;
		}
	});

	it("passes from, to, subject, and html correctly to Resend client", async () => {
		await sendEmail({
			to: testData.user.email,
			subject: "Welcome",
			html: "<p>Hello</p>",
		});

		expect(sendMock).toHaveBeenCalledWith({
			from: testData.resend.from,
			to: testData.user.email,
			subject: "Welcome",
			html: "<p>Hello</p>",
		});
	});

	it("resolves without throwing when provider returns no error", async () => {
		sendMock.mockResolvedValue({ error: null });

		await expect(
			sendEmail({
				to: testData.user.email,
				subject: "All good",
				html: "<p>Content</p>",
			}),
		).resolves.toBeUndefined();
	});

	it("throws ApiError with EMAIL_ERROR when provider returns an error", async () => {
		sendMock.mockResolvedValue({
			error: { name: "provider_error", message: "Provider failed" },
		});

		await expect(
			sendEmail({
				to: testData.user.email,
				subject: "Failure",
				html: "<p>Content</p>",
			}),
		).rejects.toMatchObject({
			name: "ApiError",
			message: "Error while attempting to send email",
			statusCode: 500,
			code: "EMAIL_ERROR",
			isOperational: true,
		});
	});

	it("includes provider error details in development environment", async () => {
		process.env.NODE_ENV = "development";
		sendMock.mockResolvedValue({
			error: { name: "provider_error", message: "Provider failed", code: "rate_limit" },
		});

		await expect(
			sendEmail({
				to: testData.user.email,
				subject: "Failure",
				html: "<p>Content</p>",
			}),
		).rejects.toMatchObject({
			code: "EMAIL_ERROR",
			details: {
				name: "provider_error",
				message: "Provider failed",
				code: "rate_limit",
			},
		});
	});

	it("omits provider error details in production environment", async () => {
		process.env.NODE_ENV = "production";
		sendMock.mockResolvedValue({
			error: { name: "provider_error", message: "Provider failed", code: "rate_limit" },
		});

		try {
			await sendEmail({
				to: testData.user.email,
				subject: "Failure",
				html: "<p>Content</p>",
			});
			expect.unreachable("Expected sendEmail to throw");
		} catch (error) {
			expect(error).toMatchObject({
				code: "EMAIL_ERROR",
				message: "Error while attempting to send email",
			});
			expect(error).not.toHaveProperty("details");
		}
	});

	it("throws configured ApiError when RESEND_FROM is unset to avoid silent failures", async () => {
		delete process.env.RESEND_FROM;

		await expect(
			sendEmail({
				to: testData.user.email,
				subject: "Missing config",
				html: "<p>Content</p>",
			}),
		).rejects.toMatchObject({
			name: "ApiError",
			message: "Email sender is not configured",
			statusCode: 500,
			code: "EMAIL_ERROR",
			isOperational: true,
			details: {
				missingEnvVar: "RESEND_FROM",
			},
		});

		expect(sendMock).not.toHaveBeenCalled();
	});
});
