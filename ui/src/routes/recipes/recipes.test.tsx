import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Recipes from "@/routes/recipes";
import {
	CREATE_RECIPE_FORM_LABEL,
	RECIPES_PAGE_HEADING,
	RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
	RECIPE_FORM_COOK_TIME_VALUE_LABEL,
	RECIPE_FORM_OPEN_BUTTON_LABEL,
	RECIPE_FORM_PORTIONS_LABEL,
	RECIPE_FORM_PREP_TIME_VALUE_LABEL,
	RECIPE_FORM_SHELF_LIFE_VALUE_LABEL,
	RECIPE_INGREDIENT_QUANTITY_LABEL,
	RECIPE_NAME_REQUIRED,
	RECIPE_FORM_METHOD_LABEL,
	RECIPE_FORM_CREATE_BUTTON_LABEL,
	RECIPE_FORM_NAME_LABEL,
	RECIPE_INGREDIENTS_REQUIRED,
	RECIPE_INGREDIENT_DELETE_LABEL,
	RECIPE_INGREDIENT_UNTITLED_LABEL,
	RECIPE_METHOD_REQUIRED,
} from "@/lib/content-strings";
import {
	ingredients,
	ingredientCheddarCheese,
	recipeCaek,
	recipeCheeseOnToast,
	recipeIngredientPasta,
	recipeIngredientPastaRecipeId,
} from "@/test/fixtures";
import type { CreateRecipePayload, Recipe } from "@recipe-book/shared/types/recipe";
import * as recipesApi from "@/lib/api/recipes";
import * as ingredientsApi from "@/lib/api/ingredients";

vi.mock("@/lib/api/recipes");
vi.mock("@/lib/api/ingredients");

function mockGetRecipes() {
	vi.mocked(recipesApi.getRecipes).mockResolvedValueOnce([
		{
			...recipeCaek,
		},
	]);
}

function mockGetIngredients() {
	vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce(ingredients);
}

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

function mockAndRenderAll() {
	mockGetRecipes();
	mockGetIngredients();
	renderRecipes();
}

async function openAndPopulateRecipeForm(user: UserEvent, validValues: Recipe) {
	await user.click(screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }));
	await user.clear(screen.getByLabelText(RECIPE_FORM_NAME_LABEL));
	await user.type(screen.getByLabelText(RECIPE_FORM_NAME_LABEL), validValues.name);

	const addIngredientBtn = screen.getByRole("button", {
		name: RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
	});
	await user.click(addIngredientBtn);

	const ingredientItem = screen.getByRole("listitem", {
		name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1`,
	});
	const ingredientNameInput = within(ingredientItem).getByTestId("ingredient-name-autocomplete");
	await user.clear(ingredientNameInput);
	await user.type(ingredientNameInput, recipeIngredientPasta.ingredient.name);

	const ingredientQuantityInput = within(ingredientItem).getByLabelText(
		RECIPE_INGREDIENT_QUANTITY_LABEL,
	);
	await user.clear(ingredientQuantityInput);
	await user.type(ingredientQuantityInput, recipeIngredientPasta.quantity.toString());

	await user.clear(screen.getByLabelText(RECIPE_FORM_METHOD_LABEL));
	await user.type(screen.getByLabelText(RECIPE_FORM_METHOD_LABEL), validValues.method);

	const prepTimeValueInput = screen.getByLabelText(RECIPE_FORM_PREP_TIME_VALUE_LABEL);
	await user.clear(prepTimeValueInput);
	await user.type(prepTimeValueInput, validValues.prepTime.toString());

	const cookTimeValueInput = screen.getByLabelText(RECIPE_FORM_COOK_TIME_VALUE_LABEL);
	await user.clear(cookTimeValueInput);
	await user.type(cookTimeValueInput, validValues.cookTime.toString());

	const shelfLifeValueInput = screen.getByLabelText(RECIPE_FORM_SHELF_LIFE_VALUE_LABEL);
	await user.clear(shelfLifeValueInput);
	await user.type(shelfLifeValueInput, validValues.shelfLife.toString());

	const portionsValueInput = screen.getByLabelText(RECIPE_FORM_PORTIONS_LABEL);
	await user.clear(portionsValueInput);
	await user.type(portionsValueInput, validValues.portions.toString());
}

const createRecipePayload: CreateRecipePayload = {
	name: "Pasta Aglio e Olio",
	ingredients: [
		{
			ingredientId: "",
			name: recipeIngredientPasta.ingredient.name,
			quantity: 999,
			unit: "GRAM",
		},
	],
	method: "Fry garlic in oil and toss with pasta",
	prepTime: {
		time: 5,
		unit: "MINUTES",
	},
	cookTime: {
		time: 15,
		unit: "MINUTES",
	},
	shelfLife: {
		time: 2,
		unit: "DAYS",
	},
	numberOfPortions: 2,
};

const createdRecipe: Recipe = {
	createdAt: "2026-05-22T20:21:46.197Z",
	updatedAt: "2026-05-22T20:21:46.197Z",
	userId: "4a888465-46e0-4feb-bc55-eaccb755a88d",
	id: recipeIngredientPastaRecipeId,
	name: createRecipePayload.name,
	ingredients: [
		{
			...recipeIngredientPasta,
		},
	],
	method: createRecipePayload.method,
	prepTime: createRecipePayload.prepTime.time,
	prepTimeUnit: createRecipePayload.prepTime.unit,
	cookTime: createRecipePayload.cookTime.time,
	cookTimeUnit: createRecipePayload.cookTime.unit,
	shelfLife: createRecipePayload.shelfLife.time,
	shelfLifeUnit: createRecipePayload.shelfLife.unit,
	portions: createRecipePayload.numberOfPortions,
};

describe("Recipes", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			mockAndRenderAll();

			expect(
				screen.getByRole("heading", { level: 1, name: RECIPES_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a button to open the create recipe form", () => {
			mockAndRenderAll();

			expect(
				screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }),
			).toBeInTheDocument();
		});
	});

	describe("conditional UI", () => {
		it("loads and renders recipes returned by the API as RecipeItems", async () => {
			vi.mocked(recipesApi.getRecipes).mockResolvedValueOnce([
				{ ...recipeCaek },
				{ ...recipeCheeseOnToast },
			]);
			mockGetIngredients();
			renderRecipes();

			expect(await screen.findByText(recipeCaek.name)).toBeInTheDocument();
			expect(screen.getByText(recipeCheeseOnToast.name)).toBeInTheDocument();

			const recipeListItems = screen.getAllByTestId("recipe-list-item");
			expect(recipeListItems.length).toBe(2);
		});

		it("renders the create recipe form when the add recipe button is clicked", async () => {
			mockAndRenderAll();

			expect(
				screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
			).not.toBeInTheDocument();

			const user = userEvent.setup();

			user.click(screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }));

			await waitFor(() => {
				expect(
					screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
				).toBeInTheDocument();
			});
		});
	});

	describe("create recipe", () => {
		describe("happy path", () => {
			it("creates a recipe, closes the form, and refreshes the list after a successful request", async () => {
				mockAndRenderAll();

				vi.mocked(recipesApi.createRecipe).mockResolvedValueOnce(createdRecipe);

				const user = userEvent.setup();

				await openAndPopulateRecipeForm(user, createdRecipe);

				await user.click(
					screen.getByRole("button", { name: RECIPE_FORM_CREATE_BUTTON_LABEL }),
				);

				await waitFor(() => {
					const errorMessages = screen.queryByText(RECIPE_INGREDIENTS_REQUIRED);
					if (errorMessages) {
						console.log("Form validation failed");
					} else if (screen.queryByText(createdRecipe.name)) {
						expect(screen.getByText(createdRecipe.name)).toBeInTheDocument();
					}
				});

				expect(vi.mocked(recipesApi.createRecipe)).toHaveBeenCalledOnce();
				expect(vi.mocked(recipesApi.createRecipe).mock.calls[0][0]).toEqual(
					createRecipePayload,
				);
			});
		});

		describe("recipe ingredients", () => {
			it("appends an empty item to the ingredients list when the add ingredient button is clicked", async () => {
				mockAndRenderAll();

				expect(
					screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
				).not.toBeInTheDocument();

				const user = userEvent.setup();

				user.click(screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }));

				await waitFor(() => {
					expect(
						screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
					).toBeInTheDocument();
				});

				expect(
					screen.queryByRole("listitem", {
						name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1`,
					}),
				).not.toBeInTheDocument();
				expect(
					screen.queryByRole("listitem", {
						name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 2`,
					}),
				).not.toBeInTheDocument();

				const addIngredientBtn = screen.getByRole("button", {
					name: RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
				});
				await user.click(addIngredientBtn);

				expect(
					screen.getByRole("listitem", { name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1` }),
				).toBeInTheDocument();

				await user.click(addIngredientBtn);

				expect(
					screen.getByRole("listitem", { name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1` }),
				).toBeInTheDocument();
				expect(
					screen.getByRole("listitem", { name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 2` }),
				).toBeInTheDocument();
			});

			it("removes the correct item from the ingredients list when the item's delete button is clicked", async () => {
				mockAndRenderAll();

				expect(
					screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
				).not.toBeInTheDocument();

				const user = userEvent.setup();

				user.click(screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }));

				await waitFor(() => {
					expect(
						screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
					).toBeInTheDocument();
				});

				expect(
					screen.queryByRole("listitem", { name: "ingredient 1" }),
				).not.toBeInTheDocument();
				expect(
					screen.queryByRole("listitem", { name: "ingredient 2" }),
				).not.toBeInTheDocument();

				const addIngredientBtn = screen.getByRole("button", {
					name: RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
				});
				await user.click(addIngredientBtn);
				await user.click(addIngredientBtn);
				await user.click(addIngredientBtn);

				const item1 = screen.getByRole("listitem", {
					name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1`,
				});
				const item2 = screen.getByRole("listitem", {
					name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 2`,
				});
				const item3 = screen.getByRole("listitem", {
					name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 3`,
				});

				expect(item1).toBeInTheDocument();
				expect(item2).toBeInTheDocument();
				expect(item3).toBeInTheDocument();

				await user.click(
					within(item2).getByRole("button", { name: RECIPE_INGREDIENT_DELETE_LABEL }),
				);

				await waitFor(() => {
					expect(item1).toBeInTheDocument();
					expect(item3).toBeInTheDocument();
					expect(item2).not.toBeInTheDocument();
				});
			});

			it("renders the correct aria-label for ingredient list items based on whether or not they have text populated in the name field", async () => {
				mockAndRenderAll();

				expect(
					screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
				).not.toBeInTheDocument();

				const user = userEvent.setup();

				user.click(screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }));

				await waitFor(() => {
					expect(
						screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
					).toBeInTheDocument();
				});

				const addIngredientBtn = screen.getByRole("button", {
					name: RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
				});
				await user.click(addIngredientBtn);

				expect(
					screen.getByRole("listitem", {
						name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1`,
					}),
				).toBeInTheDocument();

				const ingredientNameInput = screen.getByTestId("ingredient-name-autocomplete");
				await user.clear(ingredientNameInput);
				await user.type(ingredientNameInput, "test ingredient name");

				expect(
					screen.queryByRole("listitem", {
						name: `${RECIPE_INGREDIENT_UNTITLED_LABEL} 1`,
					}),
				).not.toBeInTheDocument();
				expect(
					screen.getByRole("listitem", {
						name: "test ingredient name",
					}),
				).toBeInTheDocument();
			});
		});

		// TODO: describe block for prep time, cook time, shelf life, and portions - time field value resets to zero when cleared (to check type coercion and avoid NaN issue)

		describe("validation", () => {
			it("displays a validation error when no name is provided", async () => {
				mockAndRenderAll();

				const user = userEvent.setup();

				await openAndPopulateRecipeForm(user, createdRecipe);
				await user.clear(screen.getByLabelText(RECIPE_FORM_NAME_LABEL));

				await user.click(
					screen.getByRole("button", { name: RECIPE_FORM_CREATE_BUTTON_LABEL }),
				);

				await waitFor(() => {
					expect(screen.getByText(RECIPE_NAME_REQUIRED)).toBeInTheDocument();
				});
			});

			it("displays a form error when no ingredients are provided", async () => {
				mockAndRenderAll();

				const user = userEvent.setup();

				await openAndPopulateRecipeForm(user, createdRecipe);

				await user.click(
					within(
						screen.getByRole("listitem", {
							name: recipeIngredientPasta.ingredient.name,
						}),
					).getByRole("button", { name: RECIPE_INGREDIENT_DELETE_LABEL }),
				);

				await user.click(
					screen.getByRole("button", { name: RECIPE_FORM_CREATE_BUTTON_LABEL }),
				);

				await waitFor(() => {
					expect(screen.getByText(RECIPE_INGREDIENTS_REQUIRED)).toBeInTheDocument();
				});
			});

			it("displays a form error when no method is provided", async () => {
				mockAndRenderAll();

				const user = userEvent.setup();

				await openAndPopulateRecipeForm(user, createdRecipe);
				await user.clear(screen.getByLabelText(RECIPE_FORM_METHOD_LABEL));

				await user.click(
					screen.getByRole("button", { name: RECIPE_FORM_CREATE_BUTTON_LABEL }),
				);

				await waitFor(() => {
					expect(screen.getByText(RECIPE_METHOD_REQUIRED)).toBeInTheDocument();
				});
			});

			// it("displays a form error when prep time value is zero", async () => {
			// TODO
			// });

			// it("displays a form error when cook time value is zero", () => {
			// TODO
			// });

			// it("displays a form error when shelf life value is zero", () => {
			// TODO
			// });

			// it("displays a form error when portions value is zero", () => {
			// TODO
			// });

			it("displays a form error when the API returns an error response", async () => {
				vi.mocked(recipesApi.getRecipes).mockResolvedValueOnce([]);
				vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce(ingredients);
				vi.mocked(recipesApi.createRecipe).mockRejectedValueOnce(
					new Error(RECIPE_NAME_REQUIRED),
				);

				renderRecipes();

				// TODO: convert to use userEvent
				fireEvent.click(
					screen.getByRole("button", { name: RECIPE_FORM_OPEN_BUTTON_LABEL }),
				);
				fireEvent.change(screen.getByLabelText(RECIPE_FORM_NAME_LABEL), {
					target: { value: "Test Recipe" },
				});
				fireEvent.change(screen.getByLabelText(RECIPE_FORM_METHOD_LABEL), {
					target: { value: "Do something" },
				});

				const addIngredientBtn = screen.getByRole("button", {
					name: RECIPE_FORM_ADD_INGREDIENT_BUTTON_LABEL,
				});
				fireEvent.click(addIngredientBtn);

				const combobox = await screen.findByTestId("ingredient-name-autocomplete");

				fireEvent.change(combobox, {
					target: { value: ingredientCheddarCheese.name },
				});

				const quantityInput = screen.getByLabelText(RECIPE_INGREDIENT_QUANTITY_LABEL);
				fireEvent.change(quantityInput, { target: { value: "1" } });

				fireEvent.submit(screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }));

				await waitFor(() => {
					expect(screen.getByText(RECIPE_NAME_REQUIRED)).toBeInTheDocument();
				});
			});
		});
	});
});
