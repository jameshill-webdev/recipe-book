import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import NotFound from "@/routes/not-found";
import { NOT_FOUND_PAGE_HEADING } from "@/lib/content-strings";

describe("NotFound", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: NOT_FOUND_PAGE_HEADING }),
		).toBeInTheDocument();
	});
});
