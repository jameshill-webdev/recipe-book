import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import SignUp from "@/routes/sign-up";
import { networkError } from "@/lib/messages";

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

	it("shows multiple inline validation errors at once and skips API calls", () => {
		render(
			<MemoryRouter>
				<SignUp />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "invalid-email" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "12345" },
		});
		fireEvent.change(screen.getByLabelText("Display name"), {
			target: { value: "   " },
		});
		fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

		expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
		expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
		expect(screen.getByText("Display name is required")).toBeInTheDocument();
		expect(mockSignUpFunction).not.toHaveBeenCalled();
		expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
	});

	it("shows a validation error and skips API calls when form data is invalid", () => {
		render(
			<MemoryRouter>
				<SignUp />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "12345" },
		});
		fireEvent.change(screen.getByLabelText("Display name"), {
			target: { value: "Test User" },
		});
		fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

		expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
		expect(mockSignUpFunction).not.toHaveBeenCalled();
		expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
	});

	it("shows a network error message when sign-up request fails to reach server", async () => {
		mockSignUpFunction.mockRejectedValueOnce(new TypeError("Failed to fetch"));

		render(
			<MemoryRouter>
				<SignUp />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "password123" },
		});
		fireEvent.change(screen.getByLabelText("Display name"), {
			target: { value: "Test User" },
		});
		fireEvent.submit(screen.getByRole("button", { name: "Create account" }));

		expect(await screen.findByText(networkError)).toBeInTheDocument();
		expect(mockSendVerificationEmailFunction).not.toHaveBeenCalled();
	});

	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<SignUp />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Sign up" })).toBeInTheDocument();
	});
});
