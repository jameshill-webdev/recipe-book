import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecipeDetailsPage from "./RecipeDetails";
import { recipeCaek } from "@/test/fixtures";
import * as recipesApi from "@/lib/api/recipes";
import { LOADING_SPINNER_ARIA_LABEL } from "@/lib/content-strings";

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
			vi.spyOn(recipesApi, "getRecipeById").mockResolvedValue(recipeCaek);
		});

		it("renders a level 1 heading with the correct text content (recipe name)", async () => {
			renderRecipeDetails();

			const heading = await screen.findByRole("heading", {
				level: 1,
				name: recipeCaek.name,
			});

			expect(heading).toBeInTheDocument();
		});

		it("renders an edit button next to the level 1 heading", async () => {
			renderRecipeDetails();

			const button = await screen.findByRole("button", {
				name: "Edit recipe",
			});

			expect(button).toBeInTheDocument();
		});

		it("renders a loading spinner when the recipe data is loading (getRecipe pending)", async () => {
			renderRecipeDetails();

			const spinner = screen.getByLabelText(LOADING_SPINNER_ARIA_LABEL);

			expect(spinner).toBeInTheDocument();
		});

		// this app functionality is actually broken - if you enter an invalid recipe slug, backend errors are thrown and loading spinner shows forever
		// it("renders the expected message if no recipe data was returned", async () => {
		// 	vi.spyOn(recipesApi, "getRecipeById").mockResolvedValueOnce(undefined);
		// 	renderRecipeDetails();

		// 	console.log("404 test\n", screen.getByTestId("recipe-details-page").outerHTML);

		// 	await waitFor(() => {
		// 		const message = screen.getByLabelText(RECIPE_DETAILS_NOT_FOUND);

		// 		expect(message).toBeInTheDocument();
		// 	});
		// });

		// it("renders a ViewRecipeDetails component when the recipe data has loaded and the component is not in edit mode", async () => {
		// 	// TODO
		// });

		// it("renders an EditRecipeDetails component when the recipe data has loaded and the component is in edit mode", async () => {
		// 	// TODO
		// });
	});
});
