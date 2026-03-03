import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ForgotPassword from "@/routes/forgot-password";

describe("Forgot Password", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Forgot Password" }),
		).toBeInTheDocument();
	});
});
