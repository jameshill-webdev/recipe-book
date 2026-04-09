import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IngredientForm } from "./ingredient-form";

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
	it("renders the create form and submits with the provided handler when zod validation passes", () => {
		const { props } = renderIngredientForm();

		expect(screen.getByRole("form", { name: "Create ingredient" })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Sugar");
		expect(screen.getByRole("spinbutton", { name: "Cost per unit" })).toHaveDisplayValue(
			"2.50",
		);
		expect(screen.getByRole("combobox", { name: "Purchase unit" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create" })).toBeEnabled();

		fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

		expect(props.submitHandler).toHaveBeenCalledTimes(1);
	});

	it("shows zod validation errors and skips submit when required fields are missing", () => {
		const { props } = renderIngredientForm({
			name: "",
			costPerUnit: "",
			purchaseUnit: "",
		});

		fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

		expect(screen.getByText("Name is required")).toBeInTheDocument();
		expect(screen.getByText("Cost per unit is required")).toBeInTheDocument();
		expect(screen.getByText("Purchase unit is required")).toBeInTheDocument();
		expect(props.submitHandler).not.toHaveBeenCalled();
	});

	it("shows a zod validation error and skips submit when cost per unit is negative", () => {
		const { props } = renderIngredientForm({
			costPerUnit: "-1",
		});

		fireEvent.submit(screen.getByRole("form", { name: "Create ingredient" }));

		expect(screen.getByText("Cost per unit must be a positive number")).toBeInTheDocument();
		expect(props.submitHandler).not.toHaveBeenCalled();
	});

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

	it("renders edit mode with visually hidden labels, a disabled pending button, and an error", () => {
		renderIngredientForm({
			label: "Edit ingredient",
			isEdit: true,
			mutation: { isPending: true },
			formError: "Validation failed",
		});

		expect(screen.getByRole("button", { name: "Updating..." })).toBeDisabled();
		expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
		expect(screen.getByText("Name", { selector: "label" })).toHaveClass("sr-only");
		expect(screen.getByText("Cost per unit", { selector: "label" })).toHaveClass("sr-only");
		expect(screen.getByText("Purchase unit", { selector: "label" })).toHaveClass("sr-only");
	});
});
