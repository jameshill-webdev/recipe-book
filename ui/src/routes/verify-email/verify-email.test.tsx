import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import VerifyEmail from "@/routes/verify-email";
import { VERIFY_EMAIL_PAGE_HEADING } from "@/lib/content-strings";

describe("VerifyEmail", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<VerifyEmail />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: VERIFY_EMAIL_PAGE_HEADING }),
		).toBeInTheDocument();
	});
});
