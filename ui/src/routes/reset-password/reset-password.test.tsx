import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ResetPassword from "@/routes/reset-password";
import { RESET_PASSWORD_PAGE_HEADING } from "@/lib/content-strings";

describe("ResetPassword", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<ResetPassword />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: RESET_PASSWORD_PAGE_HEADING }),
		).toBeInTheDocument();
	});
});
