import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, it, expect, vi } from "vitest";
import Login from "@/routes/login";
import {
	FORGOT_PASSWORD_LINK_TEXT,
	LOGIN_BUTTON_TEXT,
	LOGIN_FORM_LABEL,
	SIGNUP_LINK_TEXT,
} from "@/lib/messages";

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
					<Route path="/" element={<h1>Home</h1>} />
				</Routes>
			</MemoryRouter>,
		);

		expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
	});

	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Log In" })).toBeInTheDocument();
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

		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
		expect(screen.getByText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
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
					<Route path="/" element={<h1>Home</h1>} />
				</Routes>
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByRole("button", { name: LOGIN_BUTTON_TEXT }));

		expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
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

		expect(screen.getByText("You have been logged out successfully.")).toBeInTheDocument();
	});

	// TODO: add form validation tests
});
