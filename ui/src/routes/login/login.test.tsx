import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, it, expect, vi } from "vitest";
import Login from "@/routes/login";
import {
	EMAIL_REQUIRED,
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FORGOT_PASSWORD_LINK_TEXT,
	HOME_PAGE_HEADING,
	INVALID_EMAIL,
	LOGIN_BUTTON_TEXT,
	LOGIN_FORM_LABEL,
	LOGIN_PAGE_HEADING,
	LOGOUT_SUCCESS,
	NETWORK_ERROR,
	PASSWORD_REQUIRED,
	PASSWORD_TOO_LONG,
	PASSWORD_TOO_SHORT,
	SIGNUP_LINK_TEXT,
} from "@/lib/content-strings";
import {
	MINIMUM_PASSWORD_LENGTH,
	MAXIMUM_PASSWORD_LENGTH,
} from "@recipe-book/shared/lib/constants";

const { mockLoginFunction, mockUseSession } = vi.hoisted(() => ({
	mockLoginFunction: vi.fn(),
	mockUseSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: mockUseSession,
		signIn: {
			email: mockLoginFunction,
		},
	},
}));

beforeEach(() => {
	mockLoginFunction.mockReset();
	mockUseSession.mockReset();
	mockUseSession.mockReturnValue({ data: null, isPending: false });
});

describe("Login", () => {
	it("redirects to home when user is already logged in", async () => {
		mockUseSession.mockReturnValueOnce({
			data: { session: { id: "session_123" } },
			isPending: false,
		});

		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<h1>{HOME_PAGE_HEADING}</h1>} />
				</Routes>
			</MemoryRouter>,
		);

		expect(
			await screen.findByRole("heading", { level: 1, name: HOME_PAGE_HEADING }),
		).toBeInTheDocument();
	});

	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: LOGIN_PAGE_HEADING }),
		).toBeInTheDocument();
	});

	it("renders a login form", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByRole("form", { name: LOGIN_FORM_LABEL })).toBeInTheDocument();
	});

	it("renders email and password fields with correct labels", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByText(FIELD_LABEL_EMAIL)).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: FIELD_LABEL_EMAIL })).toBeInTheDocument();
		expect(screen.getByText(FIELD_LABEL_PASSWORD)).toBeInTheDocument();
		expect(screen.getByLabelText(FIELD_LABEL_PASSWORD)).toBeInTheDocument();
	});

	it("renders a submit button with the correct text", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT })).toBeInTheDocument();
	});

	it("renders a forgot password link with the correct text", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: FORGOT_PASSWORD_LINK_TEXT })).toBeInTheDocument();
	});

	it("renders a signup link with the correct text", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByRole("link", { name: SIGNUP_LINK_TEXT })).toBeInTheDocument();
	});

	it("navigates to the home page after successful login", async () => {
		mockLoginFunction.mockImplementationOnce(
			async (
				_credentials: { email: string; password: string },
				options: { onSuccess?: () => void },
			) => {
				options.onSuccess?.();
			},
		);

		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<h1>{HOME_PAGE_HEADING}</h1>} />
				</Routes>
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

		expect(
			await screen.findByRole("heading", { level: 1, name: HOME_PAGE_HEADING }),
		).toBeInTheDocument();
	});

	it("shows logout success message when redirected after logout", () => {
		render(
			<MemoryRouter
				initialEntries={[
					{
						pathname: "/login",
						state: { loggedOut: true },
					},
				]}
			>
				<Login />
			</MemoryRouter>,
		);

		expect(screen.getByText(LOGOUT_SUCCESS)).toBeInTheDocument();
	});

	describe("form validation and other error scenarios", () => {
		const TEST_DATA = {
			valid: {
				email: "test@email.com",
				password: "a".repeat(MINIMUM_PASSWORD_LENGTH + 1),
			},
			invalid: {
				email: "invalidemail",
				password: "",
			},
			tooShort: {
				password: "a".repeat(MINIMUM_PASSWORD_LENGTH - 1),
			},
			tooLong: {
				password: "a".repeat(MAXIMUM_PASSWORD_LENGTH + 1),
			},
		};

		beforeEach(() => {
			render(
				<MemoryRouter>
					<Login />
				</MemoryRouter>,
			);
		});

		it("shows a network error message when login request fails to reach server", async () => {
			mockLoginFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
		});

		it("shows the correct validation error and skips API calls when email is missing", () => {
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();
			expect(mockLoginFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is missing", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_REQUIRED)).toBeInTheDocument();
			expect(mockLoginFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when email is invalid", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.invalid.email },
			});
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(screen.getByText(INVALID_EMAIL)).toBeInTheDocument();
			expect(mockLoginFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too short", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.tooShort.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_TOO_SHORT)).toBeInTheDocument();
			expect(mockLoginFunction).not.toHaveBeenCalled();
		});

		it("shows the correct validation error and skips API calls when password is too long", () => {
			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.tooLong.password },
			});
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

			expect(screen.getByText(PASSWORD_TOO_LONG)).toBeInTheDocument();
			expect(mockLoginFunction).not.toHaveBeenCalled();
		});

		it("clears email validation error when user corrects email input", () => {
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));
			expect(screen.getByText(EMAIL_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_EMAIL), {
				target: { value: TEST_DATA.valid.email },
			});

			expect(screen.queryByText(EMAIL_REQUIRED)).not.toBeInTheDocument();
		});

		it("clears password validation error when user corrects password input", () => {
			fireEvent.submit(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));
			expect(screen.getByText(PASSWORD_REQUIRED)).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(FIELD_LABEL_PASSWORD), {
				target: { value: TEST_DATA.valid.password },
			});

			expect(screen.queryByText(PASSWORD_REQUIRED)).not.toBeInTheDocument();
		});
	});
});
