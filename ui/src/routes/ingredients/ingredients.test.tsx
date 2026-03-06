import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Ingredients from "@/routes/ingredients";
import { INGREDIENTS_PAGE_HEADING } from "@/lib/content-strings";

describe("Ingredients", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Ingredients />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: INGREDIENTS_PAGE_HEADING }),
		).toBeInTheDocument();
	});
});
