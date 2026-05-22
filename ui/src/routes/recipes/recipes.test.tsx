import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Recipes from "@/routes/recipes";
import {
	CREATE_RECIPE_FORM_LABEL,
	RECIPES_PAGE_HEADING,
	RECIPE_NAME_REQUIRED,
} from "@/lib/content-strings";

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
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ok: true, recipes: [], ingredients: [] }),
				}),
			);

			renderRecipes();

			expect(
				screen.getByRole("heading", { level: 1, name: RECIPES_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a button to open the create recipe form", () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ok: true, recipes: [], ingredients: [] }),
				}),
			);

			renderRecipes();

			expect(screen.getByRole("button", { name: /add recipe/i })).toBeInTheDocument();
		});
	});

	describe("recipes list", () => {
		it("loads and renders recipe names returned by the API", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({
						ok: true,
						recipes: [
							{
								id: "recipe-1",
								name: "Pasta Carbonara",
								ingredients: [],
								method: "Mix and cook",
								prepTime: { time: 10, unit: "MINUTES" },
								cookTime: { time: 20, unit: "MINUTES" },
								shelfLife: { time: 3, unit: "DAYS" },
								numberOfPortions: 2,
								costPerPortion: 5.5,
							},
							{
								id: "recipe-2",
								name: "Caesar Salad",
								ingredients: [],
								method: "Toss together",
								prepTime: { time: 5, unit: "MINUTES" },
								cookTime: { time: 0, unit: "MINUTES" },
								shelfLife: { time: 1, unit: "DAYS" },
								numberOfPortions: 1,
								costPerPortion: 3.0,
							},
						],
						ingredients: [],
					}),
				}),
			);

			renderRecipes();

			expect(await screen.findByText("Pasta Carbonara")).toBeInTheDocument();
			expect(screen.getByText("Caesar Salad")).toBeInTheDocument();
		});
	});

	describe("create recipe form", () => {
		it("displays a form error when no ingredients are provided", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ok: true, recipes: [], ingredients: [] }),
				}),
			);

			renderRecipes();

			fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
			expect(
				screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
			).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText("Name"), {
				target: { value: "Empty Recipe" },
			});
			fireEvent.change(screen.getByLabelText("Method"), {
				target: { value: "Do something" },
			});

			fireEvent.submit(screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(/please add at least one ingredient/i)).toBeInTheDocument();
			});
		});

		it("displays a form error when the API returns an error response", async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						ok: true,
						recipes: [],
						ingredients: [
							{
								id: "ingredient-1",
								name: "Test Ingredient",
								purchaseUnit: "KILOGRAM",
								costPerUnit: 1.0,
							},
						],
					}),
				})
				.mockResolvedValueOnce({
					ok: false,
					json: async () => ({ ok: false, message: "Method is required" }),
				});

			vi.stubGlobal("fetch", fetchMock);

			renderRecipes();

			fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
			fireEvent.change(screen.getByLabelText("Name"), {
				target: { value: "Test Recipe" },
			});
			fireEvent.change(screen.getByLabelText("Method"), {
				target: { value: "Do something" },
			});

			// Add an ingredient using the add button
			const addIngredientBtn = screen.getByRole("button", { name: /add ingredient/i });
			fireEvent.click(addIngredientBtn);

			// Get the autocomplete input (first input without a visible label)
			const inputs = screen.getAllByRole("textbox");
			const ingredientNameInput = inputs[inputs.length - 2]; // Second to last input is ingredient name
			fireEvent.change(ingredientNameInput, { target: { value: "Test Ingredient" } });

			// Get the quantity input and set its value
			const quantityInput = screen.getAllByRole("spinbutton")[0];
			fireEvent.change(quantityInput, { target: { value: "1" } });

			fireEvent.submit(screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(/method is required/i)).toBeInTheDocument();
			});
		});

		// TODO: get this test working
		// it("creates a recipe, closes the form, and refreshes the list after a successful request", async () => {
		// 	const fetchMock = vi
		// 		.fn()
		// 		.mockResolvedValueOnce({
		// 			ok: true,
		// 			json: async () => ({
		// 				ok: true,
		// 				recipes: [],
		// 				ingredients: [
		// 					{
		// 						id: "ingredient-1",
		// 						name: "Pasta",
		// 						purchaseUnit: "KILOGRAM",
		// 						costPerUnit: 2.0,
		// 					},
		// 				],
		// 			}),
		// 		})
		// 		.mockResolvedValueOnce({
		// 			ok: true,
		// 			json: async () => ({ ok: true }),
		// 		})
		// 		.mockResolvedValueOnce({
		// 			ok: true,
		// 			json: async () => ({
		// 				ok: true,
		// 				recipes: [
		// 					{
		// 						id: "recipe-1",
		// 						name: "Pasta Aglio e Olio",
		// 						ingredients: [
		// 							{
		// 								ingredientId: "ingredient-1",
		// 								name: "Pasta",
		// 								unit: "KILOGRAM",
		// 								quantity: 0.5,
		// 							},
		// 						],
		// 						method: "Fry garlic in oil and toss with pasta",
		// 						prepTime: { time: 5, unit: "MINUTES" },
		// 						cookTime: { time: 15, unit: "MINUTES" },
		// 						shelfLife: { time: 2, unit: "DAYS" },
		// 						numberOfPortions: 2,
		// 						costPerPortion: 4.0,
		// 					},
		// 				],
		// 				ingredients: [
		// 					{
		// 						id: "ingredient-1",
		// 						name: "Pasta",
		// 						purchaseUnit: "KILOGRAM",
		// 						costPerUnit: 2.0,
		// 					},
		// 				],
		// 			}),
		// 		});

		// 	vi.stubGlobal("fetch", fetchMock);

		// 	renderRecipes();

		// 	fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
		// 	expect(
		// 		screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
		// 	).toBeInTheDocument();

		// 	fireEvent.change(screen.getByLabelText("Name"), {
		// 		target: { value: "Pasta Aglio e Olio" },
		// 	});
		// 	fireEvent.change(screen.getByLabelText("Method"), {
		// 		target: { value: "Fry garlic in oil and toss with pasta" },
		// 	});

		// 	// Add an ingredient using the add button
		// 	const addIngredientBtn = screen.getByRole("button", { name: /add ingredient/i });
		// 	fireEvent.click(addIngredientBtn);

		// 	const inputs = screen.getAllByRole("textbox");
		// 	const ingredientNameInput = inputs[inputs.length - 2];
		// 	fireEvent.change(ingredientNameInput, { target: { value: "Pasta" } });

		// 	const quantityInput = screen.getAllByRole("spinbutton")[0];
		// 	fireEvent.change(quantityInput, { target: { value: "0.5" } });

		// 	fireEvent.submit(screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }));

		// 	await waitFor(() => {
		// 		expect(fetchMock).toHaveBeenNthCalledWith(
		// 			2,
		// 			expect.stringMatching(/\/recipes$/),
		// 			expect.objectContaining({ method: "POST" }),
		// 		);
		// 	});

		// 	await waitFor(() => {
		// 		expect(
		// 			screen.queryByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
		// 		).not.toBeInTheDocument();
		// 	});

		// 	expect(await screen.findByText("Pasta Aglio e Olio")).toBeInTheDocument();
		// 	expect(fetchMock).toHaveBeenCalledTimes(3);
		// });

		it("displays a validation error when name is missing", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({
						ok: true,
						recipes: [],
						ingredients: [
							{
								id: "ingredient-1",
								name: "Test",
								purchaseUnit: "KILOGRAM",
								costPerUnit: 1,
							},
						],
					}),
				}),
			);

			renderRecipes();

			fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
			expect(
				screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }),
			).toBeInTheDocument();

			// Leave name blank and add a valid ingredient and method
			fireEvent.change(screen.getByLabelText("Method"), {
				target: { value: "Do something" },
			});
			const addIngredientBtn = screen.getByRole("button", { name: /add ingredient/i });
			fireEvent.click(addIngredientBtn);
			const inputs = screen.getAllByRole("textbox");
			const ingredientNameInput = inputs[inputs.length - 2];
			fireEvent.change(ingredientNameInput, { target: { value: "" } });
			const quantityInput = screen.getAllByRole("spinbutton")[0];
			fireEvent.change(quantityInput, { target: { value: "1" } });

			fireEvent.submit(screen.getByRole("form", { name: CREATE_RECIPE_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(RECIPE_NAME_REQUIRED)).toBeInTheDocument();
			});
		});
	});
});
