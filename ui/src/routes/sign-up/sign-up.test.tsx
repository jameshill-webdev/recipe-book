import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import SignUp from "@/routes/sign-up";
import { networkErrorMessage } from "@/lib/messages";

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

		expect(await screen.findByText(networkErrorMessage)).toBeInTheDocument();
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
