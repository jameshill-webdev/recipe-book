import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResetPassword from "@/routes/reset-password";
import {
	CONFIRM_PASSWORD_REQUIRED,
	CONFIRM_PASSWORD_TOO_LONG,
	CONFIRM_PASSWORD_TOO_SHORT,
	FIELD_LABEL_CONFIRM_PASSWORD,
	FIELD_LABEL_NEW_PASSWORD,
	NETWORK_ERROR,
	NEW_PASSWORD_REQUIRED,
	NEW_PASSWORD_TOO_LONG,
	NEW_PASSWORD_TOO_SHORT,
	PASSWORDS_DO_NOT_MATCH,
	RESET_PASSWORD_BUTTON_TEXT,
	RESET_PASSWORD_FORM_LABEL,
	RESET_PASSWORD_PAGE_HEADING,
	TOKEN_ERROR,
} from "@/lib/content-strings";
import {
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@recipe-book/shared/lib/constants";

const { mockResetPasswordFunction } = vi.hoisted(() => ({
	mockResetPasswordFunction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	authClient: {
		resetPassword: mockResetPasswordFunction,
	},
}));

beforeEach(() => {
	mockResetPasswordFunction.mockReset();
});

describe("Reset Password", () => {
	const TEST_DATA = {
		valid: {
			password: "ValidPassword123!",
			differentPassword: "DifferentPassword456!",
			token: "test-reset-token",
		},
		tooShort: {
			password: "a".repeat(MINIMUM_PASSWORD_LENGTH - 1),
		},
		tooLong: {
			password: "a".repeat(MAXIMUM_PASSWORD_LENGTH + 1),
		},
	};

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);
			expect(
				screen.getByRole("heading", { level: 1, name: RESET_PASSWORD_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a reset password form", () => {
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			expect(
				screen.getByRole("form", { name: RESET_PASSWORD_FORM_LABEL }),
			).toBeInTheDocument();
		});

		it("renders new password field with correct label", () => {
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			expect(screen.getByText(FIELD_LABEL_NEW_PASSWORD)).toBeInTheDocument();
			expect(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD)).toBeInTheDocument();
		});

		it("renders confirm password field with correct label", () => {
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			expect(screen.getByText(FIELD_LABEL_CONFIRM_PASSWORD)).toBeInTheDocument();
			expect(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD)).toBeInTheDocument();
		});

		it("renders a submit button with the correct text", () => {
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			expect(
				screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }),
			).toBeInTheDocument();
		});
	});

	describe("form validation and other error scenarios", () => {
		const renderWithToken = (token = TEST_DATA.valid.token) => {
			window.history.pushState({}, "", `/reset-password?token=${token}`);
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);
		};

		it("shows the correct validation error and skips API calls when token is missing", () => {
			window.history.pushState({}, "", "/reset-password");
			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(TOKEN_ERROR)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows a network error message when reset password request fails to reach server", async () => {
			mockResetPasswordFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
		});

		it("shows the correct validation error and skips API calls when new password is missing", () => {
			renderWithToken();

			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(NEW_PASSWORD_REQUIRED)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when new password is too short", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.tooShort.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(NEW_PASSWORD_TOO_SHORT)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when new password is too long", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.tooLong.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(NEW_PASSWORD_TOO_LONG)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when confirm password is missing", () => {
			renderWithToken();

			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(CONFIRM_PASSWORD_REQUIRED)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when confirm password is too short", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.tooShort.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(CONFIRM_PASSWORD_TOO_SHORT)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when confirm password is too long", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.tooLong.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(CONFIRM_PASSWORD_TOO_LONG)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when passwords do not match", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.valid.differentPassword },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORDS_DO_NOT_MATCH)).toBeInTheDocument();
			expect(mockResetPasswordFunction).not.toHaveBeenCalled();
		});

		it("clears new password validation error when user corrects password input", () => {
			renderWithToken();

			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));
			expect(screen.getByText(NEW_PASSWORD_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});

			expect(screen.queryByText(NEW_PASSWORD_REQUIRED)).not.toBeInTheDocument();
		});

		it("clears confirm password validation error when user corrects confirm password input", () => {
			renderWithToken();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});

			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));
			expect(screen.getByText(CONFIRM_PASSWORD_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});

			expect(screen.queryByText(CONFIRM_PASSWORD_REQUIRED)).not.toBeInTheDocument();
		});
	});

	describe("success path", () => {
		it("calls resetPassword with expected parameters on successful submit", async () => {
			mockResetPasswordFunction.mockResolvedValueOnce({ error: null });

			window.history.pushState({}, "", "/reset-password?token=" + TEST_DATA.valid.token);

			render(
				<MemoryRouter>
					<ResetPassword />
				</MemoryRouter>,
			);

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_NEW_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_CONFIRM_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: RESET_PASSWORD_BUTTON_TEXT }));

			await waitFor(() => expect(mockResetPasswordFunction).toHaveBeenCalledTimes(1));

			expect(mockResetPasswordFunction).toHaveBeenCalledWith({
				newPassword: TEST_DATA.valid.password,
				token: TEST_DATA.valid.token,
			});
		});
	});
});
