import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ViewRecipeDetails from "./view-recipe-details";
import { recipeCaek } from "@/test/fixtures";
import {
	RECIPE_DETAILS_COOKING_TIME_LABEL,
	RECIPE_DETAILS_INGREDIENTS_LABEL,
	RECIPE_DETAILS_METHOD_LABEL,
	RECIPE_DETAILS_PORTIONS_LABEL,
	RECIPE_DETAILS_PREPARATION_TIME_LABEL,
	RECIPE_DETAILS_SHELF_LIFE_LABEL,
} from "@/lib/content-strings";

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useParams: () => ({ id: "123" }),
	};
});

function renderRecipeDetails() {
	return render(
		<MemoryRouter>
			<ViewRecipeDetails recipe={recipeCaek} />
		</MemoryRouter>,
	);
}

describe("ViewRecipeDetails", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe("static UI", () => {
		beforeEach(() => {
			renderRecipeDetails();
		});

		it("renders prep time label and correct value", async () => {
			await waitFor(() => {
				const label = screen.getByText(`${RECIPE_DETAILS_PREPARATION_TIME_LABEL}:`, {
					selector: "dt",
				});
				const value = label.nextSibling?.textContent || undefined;

				expect(label).toBeInTheDocument();
				expect(value).toBe("1 minute");
			});
		});

		it("renders cook time label and correct value", async () => {
			await waitFor(() => {
				const label = screen.getByText(`${RECIPE_DETAILS_COOKING_TIME_LABEL}:`, {
					selector: "dt",
				});
				const value = label.nextSibling?.textContent || undefined;

				expect(label).toBeInTheDocument();
				expect(value).toBe("1 minute");
			});
		});

		it("renders shelf life label and correct value", async () => {
			await waitFor(() => {
				const label = screen.getByText(`${RECIPE_DETAILS_SHELF_LIFE_LABEL}:`, {
					selector: "dt",
				});
				const value = label.nextSibling?.textContent || undefined;

				expect(label).toBeInTheDocument();
				expect(value).toBe("1 day");
			});
		});

		it("renders portions label and correct value", async () => {
			await waitFor(() => {
				const label = screen.getByText(`${RECIPE_DETAILS_PORTIONS_LABEL}:`, {
					selector: "dt",
				});
				const value = label.nextSibling?.textContent || undefined;

				expect(label).toBeInTheDocument();
				expect(value).toBe("1");
			});
		});

		it("renders ingredients list heading and list items", async () => {
			await waitFor(() => {
				const label = screen.getByText(RECIPE_DETAILS_INGREDIENTS_LABEL, {
					selector: "h2",
				});
				const ingredientOne = screen.getByText("flour, 400 gs", {
					selector: "li div div div span",
				});

				expect(label).toBeInTheDocument();
				expect(ingredientOne).toBeInTheDocument();
			});
		});

		it("renders method list heading and body text", async () => {
			await waitFor(() => {
				const label = screen.getByText(RECIPE_DETAILS_METHOD_LABEL, { selector: "h2" });
				const bodyText = screen.getByText("now is time for caek");
				expect(label).toBeInTheDocument();
				expect(bodyText).toBeInTheDocument();
			});
		});
	});
});
