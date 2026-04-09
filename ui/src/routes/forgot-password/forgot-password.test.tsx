import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, it, expect, vi } from "vitest";
import ForgotPassword from "@/routes/forgot-password";
import {
	EMAIL_REQUIRED,
	FIELD_LABEL_EMAIL,
	FORGOT_PASSWORD_BUTTON_TEXT,
	FORGOT_PASSWORD_FORM_LABEL,
	FORGOT_PASSWORD_INSTRUCTIONAL_TEXT,
	FORGOT_PASSWORD_PAGE_HEADING,
	FORGOT_PASSWORD_SUCCESS_TEXT,
	INVALID_EMAIL,
	NETWORK_ERROR,
} from "@/lib/content-strings";

const { mockRequestPasswordResetFunction } = vi.hoisted(() => ({
	mockRequestPasswordResetFunction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	authClient: {
		requestPasswordReset: mockRequestPasswordResetFunction,
	},
}));

beforeEach(() => {
	mockRequestPasswordResetFunction.mockReset();
});

describe("Forgot Password", () => {
	const TEST_DATA = {
		valid: {
			email: "test@email.com",
		},
		invalid: {
			email: "invalidemail",
		},
	};

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);
			expect(
				screen.getByRole("heading", { level: 1, name: FORGOT_PASSWORD_PAGE_HEADING }),
			).toBeInTheDocument();
		});
	});

	describe("initial render (before form submission)", () => {
		it("renders an introductory paragraph with the correct text content", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			expect(screen.getByText(FORGOT_PASSWORD_INSTRUCTIONAL_TEXT)).toBeInTheDocument();
			expect(screen.queryByText(FORGOT_PASSWORD_SUCCESS_TEXT)).not.toBeInTheDocument();
		});

		it("renders a forgot password form", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			expect(
				screen.getByRole("form", { name: FORGOT_PASSWORD_FORM_LABEL }),
			).toBeInTheDocument();
		});

		it("renders email field with correct label", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			expect(screen.getByText(FIELD_LABEL_EMAIL)).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: FIELD_LABEL_EMAIL })).toBeInTheDocument();
		});

		it("renders a submit button with the correct text", () => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			expect(
				screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }),
			).toBeInTheDocument();
		});
	});

	describe("form validation and other error scenarios", () => {
		beforeEach(() => {
			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);
		});

		it("shows a network error message when forgot password request fails to reach server", async () => {
			mockRequestPasswordResetFunction.mockRejectedValueOnce(
				new TypeError("Failed to fetch"),
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
		});

		it("shows the correct validation error and skips API calls when email is missing", () => {
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();
			expect(mockRequestPasswordResetFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when email is invalid", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.invalid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(INVALID_EMAIL)).toBeInTheDocument();
			expect(mockRequestPasswordResetFunction).not.toHaveBeenCalled();
		});

		it("clears email validation error when user corrects email input", () => {
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));
			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});

			expect(screen.queryByText(EMAIL_REQUIRED)).not.toBeInTheDocument();
		});
	});

	describe("success path", () => {
		it("calls requestPasswordReset with expected parameters on successful submit", async () => {
			mockRequestPasswordResetFunction.mockResolvedValueOnce({ error: null });

			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			await waitFor(() => expect(mockRequestPasswordResetFunction).toHaveBeenCalledTimes(1));

			expect(mockRequestPasswordResetFunction).toHaveBeenCalledWith({
				email: TEST_DATA.valid.email,
				redirectTo: new URL("/reset-password", window.location.origin).toString(),
			});
		});
	});

	describe("render after form submission", () => {
		it("renders an introductory paragraph with the correct text content, and does not render the form", async () => {
			mockRequestPasswordResetFunction.mockResolvedValueOnce({ error: null });

			render(
				<MemoryRouter>
					<ForgotPassword />
				</MemoryRouter>,
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: FORGOT_PASSWORD_BUTTON_TEXT }));

			expect(await screen.findByText(FORGOT_PASSWORD_SUCCESS_TEXT)).toBeInTheDocument();
			expect(
				screen.queryByRole("form", { name: FORGOT_PASSWORD_FORM_LABEL }),
			).not.toBeInTheDocument();
		});
	});
});
