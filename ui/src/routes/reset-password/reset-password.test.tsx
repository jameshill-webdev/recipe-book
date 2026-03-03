import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import ResetPassword from "@/routes/reset-password";

describe("ResetPassword", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<ResetPassword />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Reset Password" }),
		).toBeInTheDocument();
	});
});
