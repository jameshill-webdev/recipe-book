import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Ingredients from "@/routes/ingredients";
import {
	CREATE_INGREDIENT_FORM_LABEL,
	INGREDIENTS_PAGE_HEADING,
	NETWORK_ERROR,
	INGREDIENT_COST_PER_UNIT_POSITIVE,
	INGREDIENT_COST_PER_UNIT_REQUIRED,
	INGREDIENT_NAME_REQUIRED,
} from "@/lib/content-strings";
import {
	ingredientBread,
	ingredientCheddarCheese,
	ingredientFlour,
	ingredients,
} from "@/test/fixtures";
import * as ingredientsApi from "@/lib/api/ingredients";
import type { Ingredient } from "@recipe-book/shared/types/ingredient";

vi.mock("@/lib/api/ingredients");

function mockGetIngredients() {
	vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce(ingredients);
}

const createdIngredients: Ingredient[] = [
	{
		id: "2a185476-2a0b-4e82-8643-3ad09d12fc1b",
		name: ingredientCheddarCheese.name,
		purchaseUnit: "KILOGRAM",
		costPerUnit: "2.5",
	},
];

function mockCreateIngredients() {
	vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([]);
	vi.mocked(ingredientsApi.createIngredients).mockResolvedValueOnce(createdIngredients);
}

function mockCreateIngredientsResponse() {
	vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([...createdIngredients]);
}

function renderIngredients() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<Ingredients />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe("Ingredients", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			mockGetIngredients();

			renderIngredients();

			expect(
				screen.getByRole("heading", { level: 1, name: INGREDIENTS_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a button to open the create ingredient form", () => {
			mockGetIngredients();

			renderIngredients();
			expect(screen.getByRole("button", { name: /add ingredient/i })).toBeInTheDocument();
		});
	});

	// describe("conditional UI", () => {
	// 	// TODO: add test for "does not render the create ingredient form by default"
	// 	// TODO: add test for "renders the create ingredient form when the add ingredient button is clicked"
	// });

	describe("ingredients list", () => {
		it("loads and renders ingredient names returned by the API", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([
				{
					...ingredientFlour,
				},
				{
					...ingredientBread,
				},
			]);

			renderIngredients();

			expect(await screen.findByText(ingredientFlour.name)).toBeInTheDocument();
			expect(screen.getByText(ingredientBread.name)).toBeInTheDocument();
		});
	});

	describe("create ingredient form", () => {
		it("creates an ingredient, closes the form, and refreshes the list after a successful request", async () => {
			mockCreateIngredients();

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			expect(
				screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }),
			).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			const purchaseUnitSelect = document.querySelector(
				'select[name="purchaseUnit"]',
			) as HTMLSelectElement | null;
			expect(purchaseUnitSelect).not.toBeNull();
			fireEvent.change(purchaseUnitSelect!, {
				target: { value: "KILOGRAM" },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: 2.5 },
			});

			mockCreateIngredientsResponse();

			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(vi.mocked(ingredientsApi.createIngredients)).toHaveBeenCalledOnce();
				expect(vi.mocked(ingredientsApi.createIngredients).mock.calls[0][0]).toEqual({
					ingredients: [
						{
							name: ingredientCheddarCheese.name,
							purchaseUnit: "KILOGRAM",
							costPerUnit: 2.5,
						},
					],
				});
			});

			await waitFor(() => {
				expect(
					screen.queryByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }),
				).not.toBeInTheDocument();
			});

			expect(await screen.findByText(ingredientCheddarCheese.name)).toBeInTheDocument();
		});

		it("displays a form error when name is empty", async () => {
			mockCreateIngredients();

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: "" },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: 1 },
			});

			mockCreateIngredientsResponse();

			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(INGREDIENT_NAME_REQUIRED)).toBeInTheDocument();
			});
		});

		it("displays a form error when cost per unit is negative", async () => {
			mockCreateIngredients();

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: -5 },
			});

			mockCreateIngredientsResponse();

			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(INGREDIENT_COST_PER_UNIT_POSITIVE)).toBeInTheDocument();
			});
		});

		it("displays a form error when cost per unit is not a number", async () => {
			mockCreateIngredients();

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: "invalid" },
			});

			mockCreateIngredientsResponse();

			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(INGREDIENT_COST_PER_UNIT_REQUIRED)).toBeInTheDocument();
			});
		});

		it("displays a form error when the API returns an error response", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([]);
			vi.mocked(ingredientsApi.createIngredients).mockRejectedValueOnce(
				new Error("Failed to create ingredient"),
			);

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			const purchaseUnitSelect = document.querySelector(
				'select[name="purchaseUnit"]',
			) as HTMLSelectElement | null;
			fireEvent.change(purchaseUnitSelect!, {
				target: { value: "KILOGRAM" },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: 2.5 },
			});

			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText("Failed to create ingredient")).toBeInTheDocument();
			});
		});

		it("displays a form error with generic error message on network failure during creation", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([]);
			vi.mocked(ingredientsApi.createIngredients).mockRejectedValueOnce(
				new Error(NETWORK_ERROR),
			);

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			const purchaseUnitSelect = document.querySelector(
				'select[name="purchaseUnit"]',
			) as HTMLSelectElement | null;
			fireEvent.change(purchaseUnitSelect!, {
				target: { value: "KILOGRAM" },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: 2.5 },
			});
			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(NETWORK_ERROR)).toBeInTheDocument();
			});
		});
	});

	describe("error handling", () => {
		it("displays an error message when initial ingredients fetch fails", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockRejectedValueOnce(
				new Error(NETWORK_ERROR),
			);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText(NETWORK_ERROR)).toBeInTheDocument();
			});
		});

		it("displays a generic error message when initial ingredients fetch throws an unknown error", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockRejectedValueOnce(
				new Error("Database connection failed"),
			);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText("Database connection failed")).toBeInTheDocument();
			});
		});

		it("displays the expected message when the API returns an empty list", async () => {
			vi.mocked(ingredientsApi.getIngredients).mockResolvedValueOnce([]);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText("No ingredients yet.")).toBeInTheDocument();
			});
		});
	});
});
