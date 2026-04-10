import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IngredientForm } from "./ingredient-form";
import {
	INGREDIENT_NAME_REQUIRED,
	INGREDIENT_COST_PER_UNIT_REQUIRED,
	INGREDIENT_COST_PER_UNIT_POSITIVE,
	INGREDIENT_PURCHASE_UNIT_REQUIRED,
} from "../../lib/content-strings";

function renderIngredientForm(
	overrides: Partial<React.ComponentProps<typeof IngredientForm>> = {},
) {
	const props = {
		label: "Create ingredient",
		submitHandler: vi.fn(),
		name: "Sugar",
		setName: vi.fn(),
		purchaseUnit: "GRAM",
		setPurchaseUnit: vi.fn(),
		costPerUnit: "2.50",
		setCostPerUnit: vi.fn(),
		mutation: {
			isPending: false,
		},
		formError: null,
		setFormError: vi.fn(),
		...overrides,
	};

	return {
		...render(<IngredientForm {...props} />),
		props,
	};
}

describe("IngredientForm", () => {
	describe("static UI", () => {
		it("renders the create form with the expected fields and values", () => {
			renderIngredientForm();

			expect(screen.getByRole("form", { name: "Create ingredient" })).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Sugar");
			expect(screen.getByRole("spinbutton", { name: "Cost per unit" })).toHaveDisplayValue(
				"2.50",
			);
			expect(screen.getByRole("combobox", { name: "Purchase unit" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Create" })).toBeEnabled();
		});

		it("renders edit mode with visually hidden labels, a disabled pending button, and an error", () => {
			renderIngredientForm({
				label: "Edit ingredient",
				isEdit: true,
				mutation: { isPending: true },
				formError: "Validation failed",
			});

			expect(screen.getByRole("button", { name: "Updating ingredient" })).toBeDisabled();
			expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
			expect(screen.getByText("Name", { selector: "label" })).toHaveClass("sr-only");
			expect(screen.getByText("Cost per unit", { selector: "label" })).toHaveClass("sr-only");
			expect(screen.getByText("Purchase unit", { selector: "label" })).toHaveClass("sr-only");
		});
	});

	describe("dynamic behavior", () => {
		it("calls the field setters and clears form errors when text inputs change", () => {
			const setName = vi.fn();
			const setCostPerUnit = vi.fn();
			const setFormError = vi.fn();

			renderIngredientForm({
				name: "",
				costPerUnit: "",
				formError: "Something went wrong",
				setName,
				setCostPerUnit,
				setFormError,
			});

			fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
				target: { value: "Flour" },
			});
			fireEvent.change(screen.getByRole("spinbutton", { name: "Cost per unit" }), {
				target: { value: "1.25" },
			});

			expect(setName).toHaveBeenCalledWith("Flour");
			expect(setCostPerUnit).toHaveBeenCalledWith("1.25");
			expect(setFormError).toHaveBeenNthCalledWith(1, null);
			expect(setFormError).toHaveBeenNthCalledWith(2, null);
			expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
		});

		it("updates the selected purchase unit and clears the form error", () => {
			const setPurchaseUnit = vi.fn();
			const setFormError = vi.fn();

			renderIngredientForm({
				purchaseUnit: "",
				setPurchaseUnit,
				setFormError,
			});

			const nativeSelect = document.querySelector(
				'select[name="purchaseUnit"]',
			) as HTMLSelectElement | null;

			expect(nativeSelect).not.toBeNull();
			fireEvent.change(nativeSelect!, {
				target: { value: "LITRE" },
			});

			expect(setPurchaseUnit).toHaveBeenCalledWith("LITRE");
			expect(setFormError).toHaveBeenCalledWith(null);
		});
	});

	describe("form validation and other error scenarios", () => {
		it("shows zod validation errors and skips submit when required fields are missing", () => {
			const { props } = renderIngredientForm({
				name: "",
				costPerUnit: "",
				purchaseUnit: "",
			});

			fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

			expect(screen.getByText(INGREDIENT_NAME_REQUIRED)).toBeInTheDocument();
			expect(screen.getByText(INGREDIENT_COST_PER_UNIT_REQUIRED)).toBeInTheDocument();
			expect(screen.getByText(INGREDIENT_PURCHASE_UNIT_REQUIRED)).toBeInTheDocument();
			expect(props.submitHandler).not.toHaveBeenCalled();
		});

		it("shows a zod validation error and skips submit when cost per unit is negative", () => {
			const { props } = renderIngredientForm({
				costPerUnit: "-1",
			});

			fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

			expect(screen.getByText(INGREDIENT_COST_PER_UNIT_POSITIVE)).toBeInTheDocument();
			expect(props.submitHandler).not.toHaveBeenCalled();
		});
	});

	describe("success path", () => {
		it("submits with the provided handler when zod validation passes (create mode)", () => {
			const { props } = renderIngredientForm();

			fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

			expect(props.submitHandler).toHaveBeenCalledTimes(1);
		});

		it("submits with the provided handler when zod validation passes (edit mode)", () => {
			const { props } = renderIngredientForm({
				label: "Edit ingredient",
				isEdit: true,
			});

			fireEvent.submit(screen.getByRole("form", { name: "Edit ingredient" }));

			expect(props.submitHandler).toHaveBeenCalledTimes(1);
		});
	});
});
