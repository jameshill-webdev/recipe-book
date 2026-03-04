import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import SignUp from "@/routes/sign-up";
import {
	DISPLAY_NAME_TOO_LONG,
	DISPLAY_NAME_TOO_SHORT,
	INVALID_EMAIL,
	NETWORK_ERROR,
	PASSWORD_TOO_LONG,
	PASSWORD_TOO_SHORT,
} from "@/lib/messages";
import {
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@/lib/constants";

const { mockSignUpFunction, mockSendVerificationEmailFunction } = vi.hoisted(() => ({
	mockSignUpFunction: vi.fn(),
	mockSendVerificationEmailFunction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	authClient: {
		signUp: {
			email: mockSignUpFunction,
		},
		sendVerificationEmail: mockSendVerificationEmailFunction,
	},
}));

describe("SignUp", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("UI elements", () => {
		it("renders a level 1 heading with the correct text", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);
			expect(screen.getByRole("heading", { level: 1, name: "Sign up" })).toBeInTheDocument();
		});

		it("renders email, password, and display name fields with correct labels", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
			expect(screen.getByText("Password")).toBeInTheDocument();
			expect(screen.getByLabelText("Password")).toBeInTheDocument();
			expect(screen.getByText("Display name")).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: "Display name" })).toBeInTheDocument();
		});

		it("renders a submit button with the correct text", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
		});
	});

	describe("form validation", () => {
		const testData = {
			valid: {
				email: "test@email.com",
				password: "a".repeat(MINIMUM_PASSWORD_LENGTH + 1),
				displayName: "a".repeat(MINIMUM_DISPLAY_NAME_LENGTH + 1),
			},
			invalid: {
				email: "invalidemail",
				password: "",
				displayName: "",
			},
			tooShort: {
				password: "a".repeat(MINIMUM_PASSWORD_LENGTH - 1),
				displayName: "a".repeat(MINIMUM_DISPLAY_NAME_LENGTH - 1),
			},
			tooLong: {
				password: "a".repeat(MAXIMUM_PASSWORD_LENGTH + 1),
				displayName: "a".repeat(MAXIMUM_DISPLAY_NAME_LENGTH + 1),
			},
		};

		beforeEach(() => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);
		});

		it("shows a network error message when sign-up request fails to reach server", async () => {
			mockSignUpFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));

			fireEvent.change(screen.getByLabelText("Email"), {
				target: { value: testData.valid.email },
			});
			fireEvent.change(screen.getByLabelText("Password"), {
				target: { value: testData.valid.password },
			});
			fireEvent.change(screen.getByLabelText("Display name"), {
				target: { value: testData.valid.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when email is invalid", () => {
			fireEvent.change(screen.getByLabelText("Email"), {
				target: { value: testData.invalid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(screen.getByText(INVALID_EMAIL)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too short", () => {
			fireEvent.change(screen.getByLabelText("Password"), {
				target: { value: testData.tooShort.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(screen.getByText(PASSWORD_TOO_SHORT)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too long", () => {
			fireEvent.change(screen.getByLabelText("Password"), {
				target: { value: testData.tooLong.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(screen.getByText(PASSWORD_TOO_LONG)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when display name is too short", () => {
			fireEvent.change(screen.getByLabelText("Display name"), {
				target: { value: testData.tooShort.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(screen.getByText(DISPLAY_NAME_TOO_SHORT)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when display name is too long", () => {
			fireEvent.change(screen.getByLabelText("Display name"), {
				target: { value: testData.tooLong.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

			expect(screen.getByText(DISPLAY_NAME_TOO_LONG)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});
	});
});
