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
} from "@/lib/content-strings";
import {
	emptyIngredientsResponse,
	ingredientBread,
	ingredientCheddarCheese,
	ingredientFlour,
} from "@/test/fixtures";

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
		vi.restoreAllMocks();
	});

	describe("static UI", () => {
		it("renders a level 1 heading with the correct text content", () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				}),
			);

			renderIngredients();
			expect(
				screen.getByRole("heading", { level: 1, name: INGREDIENTS_PAGE_HEADING }),
			).toBeInTheDocument();
		});

		it("renders a button to open the create ingredient form", () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				}),
			);

			renderIngredients();
			expect(screen.getByRole("button", { name: /add ingredient/i })).toBeInTheDocument();
		});
	});

	describe("ingredients list", () => {
		it("loads and renders ingredient names returned by the API", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({
						ok: true,
						ingredients: [
							{
								...ingredientFlour,
							},
							{
								...ingredientBread,
							},
						],
					}),
				}),
			);

			renderIngredients();

			expect(await screen.findByText(ingredientFlour.name)).toBeInTheDocument();
			expect(screen.getByText(ingredientBread.name)).toBeInTheDocument();
		});
	});

	describe("create ingredient form", () => {
		it("creates an ingredient, closes the form, and refreshes the list after a successful request", async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ok: true }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						ok: true,
						ingredients: [{ ...ingredientCheddarCheese }],
					}),
				});

			vi.stubGlobal("fetch", fetchMock);

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
			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(fetchMock).toHaveBeenNthCalledWith(
					2,
					expect.stringMatching(/\/ingredients$/),
					expect.objectContaining({
						method: "POST",
						body: JSON.stringify({
							ingredients: [
								{
									name: ingredientCheddarCheese.name,
									purchaseUnit: "KILOGRAM",
									costPerUnit: 2.5,
								},
							],
						}),
					}),
				);
			});

			await waitFor(() => {
				expect(
					screen.queryByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }),
				).not.toBeInTheDocument();
			});

			expect(await screen.findByText(ingredientCheddarCheese.name)).toBeInTheDocument();
			expect(fetchMock).toHaveBeenCalledTimes(3);
		});

		it("displays a form error when cost per unit is negative", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				}),
			);

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: -5 },
			});
			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(INGREDIENT_COST_PER_UNIT_POSITIVE)).toBeInTheDocument();
			});
		});

		it("displays a form error when cost per unit is not a number", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				}),
			);

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: ingredientCheddarCheese.name },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: "invalid" },
			});
			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(screen.getByText(INGREDIENT_COST_PER_UNIT_REQUIRED)).toBeInTheDocument();
			});
		});

		it("displays a form error when the API returns an error response", async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				})
				.mockResolvedValueOnce({
					ok: false,
					json: async () => ({ ok: false, message: "Failed to create ingredient" }),
				});

			vi.stubGlobal("fetch", fetchMock);

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
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				})
				.mockRejectedValueOnce(new TypeError("Failed to fetch"));

			vi.stubGlobal("fetch", fetchMock);

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
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: false,
					json: async () => ({ ok: false, message: "Unauthorized" }),
				}),
			);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText("Unauthorized")).toBeInTheDocument();
			});
		});

		it("displays a network error message when initial ingredients fetch throws a TypeError", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText(NETWORK_ERROR)).toBeInTheDocument();
			});
		});

		it("displays a generic error message when initial ingredients fetch throws an unknown error", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockRejectedValue(new Error("Database connection failed")),
			);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText("Database connection failed")).toBeInTheDocument();
			});
		});

		it("displays no ingredients message when the API returns an empty list", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				}),
			);

			renderIngredients();

			await waitFor(() => {
				expect(screen.getByText("No ingredients yet.")).toBeInTheDocument();
			});
		});

		it("clears form error when user starts editing after an error", async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ...emptyIngredientsResponse }),
				})
				.mockResolvedValueOnce({
					ok: false,
					json: async () => ({ ok: false, message: "Creation failed" }),
				});

			vi.stubGlobal("fetch", fetchMock);

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
				expect(screen.getByText("Creation failed")).toBeInTheDocument();
			});

			// Change the name field
			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: "Carrot" },
			});

			// Error should be cleared
			expect(screen.queryByText("Creation failed")).not.toBeInTheDocument();
		});
	});
});
