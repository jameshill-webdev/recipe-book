import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	EDIT_INGREDIENT_FORM_LABEL,
	INGREDIENT_ITEM_DELETE_BUTTON_LABEL,
	INGREDIENT_ITEM_EDIT_BUTTON_LABEL,
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
				costPerUnit={1.99}
			/>
		</QueryClientProvider>,
	);
}

describe("IngredientItem", () => {
	it("renders ingredient details with edit and delete controls", () => {
		renderIngredientItem();

		expect(screen.getByTestId("ingredient-item")).toBeInTheDocument();
		expect(screen.getByText("Flour")).toBeInTheDocument();
		expect(screen.getByText("1.99")).toBeInTheDocument();
		expect(screen.getByText("kilogram")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_DELETE_BUTTON_LABEL}: Flour` }),
		).toBeInTheDocument();
	});

	it("opens and closes the edit form from the edit button", () => {
		renderIngredientItem();

		fireEvent.click(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		);
		expect(screen.getByRole("form", { name: EDIT_INGREDIENT_FORM_LABEL })).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: `${INGREDIENT_ITEM_EDIT_BUTTON_LABEL}: Flour` }),
		);
		expect(
			screen.queryByRole("form", { name: EDIT_INGREDIENT_FORM_LABEL }),
		).not.toBeInTheDocument();
		expect(screen.getByText("Flour")).toBeInTheDocument();
	});
});
