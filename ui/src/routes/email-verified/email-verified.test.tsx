import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import EmailVerified from "@/routes/email-verified";

describe("Email Verified", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<EmailVerified />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Email verified" }),
		).toBeInTheDocument();
	});
});
