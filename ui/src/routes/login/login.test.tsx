import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, it, expect, vi } from "vitest";
import Login from "@/routes/login";
import {
	FIELD_LABEL_EMAIL,
	FIELD_LABEL_PASSWORD,
	FORGOT_PASSWORD_LINK_TEXT,
	HOME_PAGE_HEADING,
	LOGIN_BUTTON_TEXT,
	LOGIN_FORM_LABEL,
	LOGIN_PAGE_HEADING,
	LOGOUT_SUCCESS,
	SIGNUP_LINK_TEXT,
} from "@/lib/content-strings";

const { mockSignInEmail, mockUseSession } = vi.hoisted(() => ({
	mockSignInEmail: vi.fn(),
	mockUseSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	authClient: {
		useSession: mockUseSession,
		signIn: {
			email: mockSignInEmail,
		},
	},
}));

beforeEach(() => {
	mockSignInEmail.mockReset();
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
		mockSignInEmail.mockImplementationOnce(
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

	// TODO: add tests for form validation errors and API error handling
});
