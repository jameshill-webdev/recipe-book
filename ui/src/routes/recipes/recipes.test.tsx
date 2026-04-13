import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Recipes from "@/routes/recipes";
import { RECIPES_PAGE_HEADING } from "@/lib/content-strings";

function renderRecipes() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<Recipes />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe("Recipes", () => {
	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			renderRecipes();

			expect(
				screen.getByRole("heading", { level: 1, name: RECIPES_PAGE_HEADING }),
			).toBeInTheDocument();
		});
	});
});
