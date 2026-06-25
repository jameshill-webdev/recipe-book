import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	EDIT_INGREDIENT_FORM_LABEL,
	INGREDIENT_ITEM_COST_ARIA_LABEL,
	INGREDIENT_ITEM_DELETE_BUTTON_LABEL,
	INGREDIENT_ITEM_EDIT_BUTTON_LABEL,
	INGREDIENT_ITEM_NAME_ARIA_LABEL,
	INGREDIENT_ITEM_UNIT_ARIA_LABEL,
} from "@/lib/content-strings";
import { IngredientItem } from "./ingredient-item";

function renderIngredientItem() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<IngredientItem
				id="ingredient-1"
				name="Flour"
				purchaseUnit="KILOGRAM"
				costPerUnit="1.99"
			/>
		</QueryClientProvider>,
	);
}

describe("IngredientItem", () => {
	it("renders ingredient details with edit and delete controls when not in edit mode", () => {
		renderIngredientItem();

		expect(screen.getByTestId("ingredient-item")).toBeVisible();
		expect(screen.getByLabelText(INGREDIENT_ITEM_NAME_ARIA_LABEL)).toBeVisible();
		expect(screen.getByLabelText(INGREDIENT_ITEM_COST_ARIA_LABEL)).toBeVisible();
		expect(screen.getByLabelText(INGREDIENT_ITEM_UNIT_ARIA_LABEL)).toBeVisible();
		expect(screen.getByTestId("ingredient-data")).toBeVisible();
		expect(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_DELETE_BUTTON_LABEL}: Flour` }),
		).toBeVisible();

		expect(
			screen.queryByRole("form", { name: EDIT_INGREDIENT_FORM_LABEL }),
		).not.toBeInTheDocument();
	});

	it("activates and deactivates the edit mode when user clicks the edit button", () => {
		renderIngredientItem();

		fireEvent.click(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		);

		expect(screen.getByTestId("ingredient-item")).toBeVisible();
		expect(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		).toBeVisible();
		expect(screen.getByRole("form", { name: EDIT_INGREDIENT_FORM_LABEL })).toBeVisible();

		expect(screen.queryByLabelText(INGREDIENT_ITEM_NAME_ARIA_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(INGREDIENT_ITEM_COST_ARIA_LABEL)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(INGREDIENT_ITEM_UNIT_ARIA_LABEL)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: `${INGREDIENT_ITEM_DELETE_BUTTON_LABEL}: Flour` }),
		).not.toBeInTheDocument();
		expect(screen.queryByTestId("ingredient-data")).not.toBeInTheDocument();
	});
});
