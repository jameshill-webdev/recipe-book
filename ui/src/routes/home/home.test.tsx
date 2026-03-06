import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Home from "@/routes/home";
import { HOME_PAGE_HEADING } from "@/lib/content-strings";

describe("Home", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Home />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: HOME_PAGE_HEADING }),
		).toBeInTheDocument();
	});
});
