import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Ingredients from "@/routes/ingredients";
import { CREATE_INGREDIENT_FORM_LABEL, INGREDIENTS_PAGE_HEADING } from "@/lib/content-strings";

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
					json: async () => ({ ok: true, ingredients: [] }),
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
					json: async () => ({ ok: true, ingredients: [] }),
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
								id: "ingredient-1",
								name: "Flour",
								purchaseUnit: "KILOGRAM",
								costPerUnit: 1.99,
							},
							{
								id: "ingredient-2",
								name: "Sugar",
								purchaseUnit: "KILOGRAM",
								costPerUnit: 2.49,
							},
						],
					}),
				}),
			);

			renderIngredients();

			expect(await screen.findByText("Flour")).toBeInTheDocument();
			expect(screen.getByText("Sugar")).toBeInTheDocument();
		});
	});

	describe("create ingredient form", () => {
		it("creates an ingredient, closes the form, and refreshes the list after a successful request", async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ ok: true, ingredients: [] }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						ok: true,
						ingredient: {
							id: "ingredient-1",
							name: "Tomato",
							purchaseUnit: "KILOGRAM",
							costPerUnit: 2.5,
						},
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						ok: true,
						ingredients: [
							{
								id: "ingredient-1",
								name: "Tomato",
								purchaseUnit: "KILOGRAM",
								costPerUnit: 2.5,
							},
						],
					}),
				});

			vi.stubGlobal("fetch", fetchMock);

			renderIngredients();

			fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
			expect(
				screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }),
			).toBeInTheDocument();

			fireEvent.change(screen.getByLabelText(/name/i), {
				target: { value: "Tomato" },
			});

			const purchaseUnitSelect = document.querySelector(
				'select[name="purchaseUnit"]',
			) as HTMLSelectElement | null;
			expect(purchaseUnitSelect).not.toBeNull();
			fireEvent.change(purchaseUnitSelect!, {
				target: { value: "KILOGRAM" },
			});

			fireEvent.change(screen.getByLabelText(/cost per unit/i), {
				target: { value: "2.5" },
			});
			fireEvent.submit(screen.getByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }));

			await waitFor(() => {
				expect(fetchMock).toHaveBeenNthCalledWith(
					2,
					expect.stringMatching(/\/ingredients$/),
					expect.objectContaining({
						method: "POST",
						body: JSON.stringify({
							name: "Tomato",
							purchaseUnit: "KILOGRAM",
							costPerUnit: 2.5,
						}),
					}),
				);
			});

			await waitFor(() => {
				expect(
					screen.queryByRole("form", { name: CREATE_INGREDIENT_FORM_LABEL }),
				).not.toBeInTheDocument();
			});

			expect(await screen.findByText("Tomato")).toBeInTheDocument();
			expect(fetchMock).toHaveBeenCalledTimes(3);
		});
	});
});
