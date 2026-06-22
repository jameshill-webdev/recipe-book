import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecipeDetailsPage from "./RecipeDetails";
import { recipeCaek } from "@/test/fixtures";
import * as recipesApi from "@/lib/api/recipes";
import {
	EDIT_RECIPE_FORM_LABEL,
	LOADING_SPINNER_ARIA_LABEL,
	RECIPE_DETAILS_NOT_FOUND,
	RECIPE_ITEM_EDIT_BUTTON_LABEL,
} from "@/lib/content-strings";
import type { Recipe } from "@recipe-book/shared/types/recipe";

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useParams: () => ({ id: "123" }),
	};
});

vi.mock("@/lib/api/recipes");

function mockGetRecipeById(recipe: Recipe | undefined = recipeCaek) {
	vi.mocked(recipesApi.getRecipeById).mockResolvedValueOnce(recipe);
}

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
		vi.resetAllMocks();
	});

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content (recipe name)", async () => {
			mockGetRecipeById();
			renderRecipeDetails();

			const heading = await screen.findByRole("heading", {
				level: 1,
				name: recipeCaek.name,
			});

			expect(heading).toBeInTheDocument();
		});

		it("renders an edit button next to the level 1 heading", async () => {
			mockGetRecipeById();
			renderRecipeDetails();

			const button = await screen.findByRole("button", {
				name: "Edit recipe",
			});

			expect(button).toBeInTheDocument();
		});

		it("renders a loading spinner when the recipe data is loading (getRecipe pending)", async () => {
			mockGetRecipeById();
			renderRecipeDetails();

			const spinner = screen.getByLabelText(LOADING_SPINNER_ARIA_LABEL);

			expect(spinner).toBeInTheDocument();
		});

		it("renders the expected message if no recipe data was returned", async () => {
			vi.mocked(recipesApi.getRecipeById).mockRejectedValueOnce(undefined);
			renderRecipeDetails();

			await waitFor(() => {
				const message = screen.getByText(RECIPE_DETAILS_NOT_FOUND);

				expect(message).toBeInTheDocument();
			});
		});

		it("renders a ViewRecipeDetails component when the recipe data has loaded and the component is not in edit mode", async () => {
			mockGetRecipeById();
			renderRecipeDetails();

			await waitFor(async () => {
				const viewRecipeDetails = screen.getByTestId("view-recipe-details");

				expect(viewRecipeDetails).toBeInTheDocument();
			});
		});

		it("renders an EditRecipeDetails component when the recipe data has loaded and the component is in edit mode", async () => {
			mockGetRecipeById();
			renderRecipeDetails();

			const user = userEvent.setup();

			await user.click(screen.getByRole("button", { name: RECIPE_ITEM_EDIT_BUTTON_LABEL }));

			await waitFor(() => {
				const editRecipeForm = screen.getByLabelText(EDIT_RECIPE_FORM_LABEL);

				expect(editRecipeForm).toBeInTheDocument();
			});
		});
	});
});
