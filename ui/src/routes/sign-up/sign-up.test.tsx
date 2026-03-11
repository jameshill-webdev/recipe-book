import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import SignUp from "@/routes/sign-up";
import {
	DISPLAY_NAME_TOO_LONG,
	DISPLAY_NAME_TOO_SHORT,
	INVALID_EMAIL,
	LOGIN_LINK_TEXT,
	NETWORK_ERROR,
	PASSWORD_TOO_LONG,
	PASSWORD_TOO_SHORT,
	SIGNUP_BUTTON_TEXT,
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FIELD_LABEL_DISPLAY_NAME,
	SIGNUP_FORM_LABEL,
	SIGNUP_PAGE_HEADING,
	EMAIL_REQUIRED,
	PASSWORD_REQUIRED,
	DISPLAY_NAME_REQUIRED,
} from "@/lib/content-strings";
import {
	MAXIMUM_DISPLAY_NAME_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_DISPLAY_NAME_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
} from "@recipe-book/shared/lib/constants";

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
			expect(
				screen.getByRole("heading", { level: 1, name: SIGNUP_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a signup form", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByRole("form", { name: SIGNUP_FORM_LABEL })).toBeInTheDocument();
		});

		it("renders email, password, and display name fields with correct labels", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByText(FIELD_LABEL_EMAIL)).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: FIELD_LABEL_EMAIL })).toBeInTheDocument();
			expect(screen.getByText(FIELD_LABEL_PASSWORD)).toBeInTheDocument();
			expect(screen.getByLabelText(FIELD_LABEL_PASSWORD)).toBeInTheDocument();
			expect(screen.getByText(FIELD_LABEL_DISPLAY_NAME)).toBeInTheDocument();
			expect(
				screen.getByRole("textbox", { name: FIELD_LABEL_DISPLAY_NAME }),
			).toBeInTheDocument();
		});

		it("renders a submit button with the correct text", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT })).toBeInTheDocument();
		});

		it("renders a login link with the correct text", () => {
			render(
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>,
			);

			expect(screen.getByRole("link", { name: LOGIN_LINK_TEXT })).toBeInTheDocument();
		});
	});

	describe("form validation", () => {
		const TEST_DATA = {
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

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_DISPLAY_NAME), {
				target: { value: TEST_DATA.valid.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when email is missing", () => {
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is missing", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_REQUIRED)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when display name is missing", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(DISPLAY_NAME_REQUIRED)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when email is invalid", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.invalid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(INVALID_EMAIL)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too short", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.tooShort.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_TOO_SHORT)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too long", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.tooLong.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_TOO_LONG)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when display name is too short", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_DISPLAY_NAME), {
				target: { value: TEST_DATA.tooShort.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(DISPLAY_NAME_TOO_SHORT)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when display name is too long", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_DISPLAY_NAME), {
				target: { value: TEST_DATA.tooLong.displayName },
			});
			fireEvent.submit(screen.getByRole("button", { name: SIGNUP_BUTTON_TEXT }));

			expect(screen.getByText(DISPLAY_NAME_TOO_LONG)).toBeInTheDocument();
			expect(mockSignUpFunction).not.toHaveBeenCalled();
			expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
		});
	});
});
