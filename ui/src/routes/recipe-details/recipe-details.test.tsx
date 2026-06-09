import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecipeDetailsPage from "./RecipeDetails";
import { recipes } from "@/test/fixtures";
import * as recipesApi from "@/lib/api/recipes";

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useParams: () => ({ id: "123" }),
	};
});

function renderRecipeDetails() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[{ pathname: "/recipes/123" }]}>
				<RecipeDetailsPage />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe("Recipe Details Page", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe("static UI", () => {
		beforeEach(() => {
			vi.spyOn(recipesApi, "getRecipeById").mockResolvedValue(recipes[0]);
			renderRecipeDetails();
		});

		it("renders a level 1 heading with the correct text content (recipe name)", async () => {
			const heading = await screen.findByRole("heading", {
				level: 1,
				name: recipes[0].name,
			});

			expect(heading).toBeInTheDocument();
		});

		it("renders an edit button next to the level 1 heading", async () => {
			const button = await screen.findByRole("button", {
				name: "Edit recipe",
			});

			expect(button).toBeInTheDocument();
		});

		// TODO: finish tests
	});
});
