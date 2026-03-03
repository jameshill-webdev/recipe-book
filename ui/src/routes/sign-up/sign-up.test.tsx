import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import SignUp from "@/routes/sign-up";

describe("SignUp", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<SignUp />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Sign up" })).toBeInTheDocument();
	});
});
