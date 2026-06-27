import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { IngredientItem } from "@/components/ingredient-item/ingredient-item";
import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import {
	CREATE_INGREDIENT_FORM_LABEL,
	GENERIC_LOADING,
	INGREDIENTS_LIST_COLUMN_LABEL_COST,
	INGREDIENTS_LIST_COLUMN_LABEL_NAME,
	INGREDIENTS_LIST_COLUMN_LABEL_UNIT,
	INGREDIENTS_LIST_NO_RESULTS,
	INGREDIENTS_PAGE_CREATE_BUTTON_LABEL_CLOSED,
	INGREDIENTS_PAGE_CREATE_BUTTON_LABEL_OPEN,
	INGREDIENTS_PAGE_HEADING,
} from "@/lib/content-strings";
import { IngredientForm } from "@/components/ingredient-form/ingredient-form";
import { getIngredients } from "@/lib/api/ingredients";
import { getErrorMessage } from "@/lib/utils";
import { PURCHASE_UNITS, type PurchaseUnit } from "@recipe-book/shared/lib/units";
import { useCreateIngredient } from "@/hooks/use-create-ingredient";

export default function Ingredients() {
	const [addIngredientUIOpen, setAddIngredientUIOpen] = useState(false);
	const [newIngredientName, setNewIngredientName] = useState("");
	const [newIngredientPurchaseUnit, setNewIngredientPurchaseUnit] = useState<PurchaseUnit>(
		PURCHASE_UNITS[0],
	);
	const [newIngredientCostPerUnit, setNewIngredientCostPerUnit] = useState<string>("0");
	const [formError, setFormError] = useState<string | null>(null);
	const {
		data: ingredients = [],
		isPending: isIngredientsPending,
		error: ingredientsError,
	} = useQuery({
		queryKey: ["ingredients"],
		queryFn: getIngredients,
	});

	const createIngredientMutation = useCreateIngredient(
		() => {
			setNewIngredientName("");
			setNewIngredientPurchaseUnit(PURCHASE_UNITS[0]);
			setNewIngredientCostPerUnit("0");
			setFormError(null);
			setAddIngredientUIOpen(false);
		},
		(error) => setFormError(error),
	);

	function onAddIngredient() {
		setAddIngredientUIOpen((prev) => !prev);
	}

	function onCreateIngredient(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		const costPerUnitAsNumber = Number(newIngredientCostPerUnit);

		if (!Number.isFinite(costPerUnitAsNumber) || costPerUnitAsNumber < 0) {
			setFormError("Please enter a valid non-negative cost per unit.");
			return;
		}

		createIngredientMutation.mutate({
			ingredients: [
				{
					name: newIngredientName.trim(),
					purchaseUnit: newIngredientPurchaseUnit.trim() as PurchaseUnit,
					costPerUnit: costPerUnitAsNumber,
				},
			],
		});
	}

	if (!isIngredientsPending && ingredients.length) {
		console.log("ingredients", JSON.stringify(ingredients));
	}

	return (
		<>
			<h1 className="my-8">{INGREDIENTS_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<Button
					className="w-[10rem] mx-auto"
					type="button"
					variant="outline"
					onClick={onAddIngredient}
					aria-expanded={addIngredientUIOpen}
					aria-controls="add-ingredient-form-container"
				>
					{addIngredientUIOpen ? <Minus /> : <Plus />}
					<span>
						{addIngredientUIOpen
							? INGREDIENTS_PAGE_CREATE_BUTTON_LABEL_OPEN
							: INGREDIENTS_PAGE_CREATE_BUTTON_LABEL_CLOSED}
					</span>
				</Button>
				<div id="add-ingredient-form-container" role="region">
					{addIngredientUIOpen && (
						<IngredientForm
							label={CREATE_INGREDIENT_FORM_LABEL}
							submitHandler={onCreateIngredient}
							name={newIngredientName}
							setName={setNewIngredientName}
							purchaseUnit={newIngredientPurchaseUnit}
							setPurchaseUnit={setNewIngredientPurchaseUnit}
							costPerUnit={newIngredientCostPerUnit}
							setCostPerUnit={setNewIngredientCostPerUnit}
							mutation={createIngredientMutation}
							formError={formError}
							setFormError={setFormError}
						/>
					)}
				</div>
			</div>
			<div>
				<div className="text-[var(--muted-foreground)] border-b-2 mb-2 px-3 pb-1 w-full grid grid-cols-[4.5fr_2fr_2fr_100px] md:grid-cols-[6.5fr_2fr_2fr_100px]">
					<span>{INGREDIENTS_LIST_COLUMN_LABEL_NAME}</span>
					<span>{INGREDIENTS_LIST_COLUMN_LABEL_COST}</span>
					<span>{INGREDIENTS_LIST_COLUMN_LABEL_UNIT}</span>
				</div>
				{isIngredientsPending ? (
					// TODO: replace with skeleton loader
					<p>{GENERIC_LOADING}</p>
				) : ingredientsError ? (
					<InlineError alert>{getErrorMessage(ingredientsError)}</InlineError>
				) : ingredients.length === 0 ? (
					<p>{INGREDIENTS_LIST_NO_RESULTS}</p>
				) : (
					<ul aria-label="ingredients">
						{ingredients.map((ingredient) => (
							<li key={ingredient.id}>
								<IngredientItem {...ingredient} />
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
