import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { IngredientItem } from "@/components/ingredient-item/ingredient-item";
import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import {
	CREATE_INGREDIENT_FORM_LABEL,
	GENERIC_LOADING,
	INGREDIENTS_PAGE_HEADING,
} from "@/lib/content-strings";
import { IngredientForm } from "@/components/ingredient-form/ingredient-form";
import { createIngredient, getIngredients } from "@/lib/api/ingredients";
import { getErrorMessage } from "@/lib/utils";
import { PURCHASE_UNITS, type PurchaseUnit } from "@recipe-book/shared/lib/units";

export default function Ingredients() {
	const queryClient = useQueryClient();
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

	const createIngredientMutation = useMutation({
		mutationFn: createIngredient,
		onSuccess: async () => {
			setNewIngredientName("");
			setNewIngredientPurchaseUnit(PURCHASE_UNITS[0]);
			setNewIngredientCostPerUnit("0");
			setFormError(null);
			setAddIngredientUIOpen(false);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});

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
			name: newIngredientName.trim(),
			purchaseUnit: newIngredientPurchaseUnit.trim() as PurchaseUnit,
			costPerUnit: newIngredientCostPerUnit.trim(),
		});
	}

	return (
		<>
			<h1>{INGREDIENTS_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<Button
					className="w-[10rem] mx-auto"
					type="button"
					variant="outline"
					onClick={onAddIngredient}
					aria-label="Add ingredient"
					aria-expanded={addIngredientUIOpen}
					aria-controls="add-ingredient-form-container"
				>
					{addIngredientUIOpen ? <Minus /> : <Plus />}
					<span>{addIngredientUIOpen ? "Close" : "Add ingredient"}</span>
				</Button>
				<div
					id="add-ingredient-form-container"
					role="region"
					aria-label="Add ingredient form"
				>
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
					<span>Name</span>
					<span>Cost</span>
					<span>Unit</span>
				</div>
				{isIngredientsPending ? (
					// TODO: replace with skeleton loader
					<p>{GENERIC_LOADING}</p>
				) : ingredientsError ? (
					<InlineError alert>{getErrorMessage(ingredientsError)}</InlineError>
				) : ingredients.length === 0 ? (
					<p>No ingredients yet.</p>
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
