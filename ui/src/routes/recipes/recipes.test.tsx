import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Recipes from "@/routes/recipes";

describe("Recipes", () => {
	it("renders a level 1 heading with the correct text content", () => {
		render(
			<MemoryRouter>
				<Recipes />
			</MemoryRouter>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Recipes" })).toBeInTheDocument();
	});
});
