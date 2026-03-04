import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Login from "@/routes/login";

describe("Login", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Log In" })).toBeInTheDocument();
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
});
