import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { IngredientItem } from "@/components/ingredient-item/ingredient-item";
import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import {
	CREATE_INGREDIENT_FORM_LABEL,
	GENERIC_ERROR,
	GENERIC_LOADING,
	INGREDIENTS_PAGE_HEADING,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import type {
	CreateIngredientPayload,
	IngredientMutationResponse,
	GetIngredientsResponse,
} from "@/lib/types/ingredient";
import { IngredientForm } from "@/components/ingredient-form/ingredient-form";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

function getErrorMessage(error: unknown) {
	if (error instanceof TypeError) {
		return NETWORK_ERROR;
	}

	return error instanceof Error ? error.message : GENERIC_ERROR;
}

async function getIngredients() {
	const response = await fetch(`${apiBaseUrl}/ingredients`, {
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as GetIngredientsResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data?.ingredients ?? [];
}

async function createIngredient(payload: CreateIngredientPayload) {
	const response = await fetch(`${apiBaseUrl}/ingredients`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export default function Ingredients() {
	const queryClient = useQueryClient();
	const [addIngredientUIOpen, setAddIngredientUIOpen] = useState(false);
	const [newIngredientName, setNewIngredientName] = useState("");
	const [newIngredientPurchaseUnit, setNewIngredientPurchaseUnit] = useState("");
	const [newIngredientCostPerUnit, setNewIngredientCostPerUnit] = useState<string | number>("");
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
			setNewIngredientPurchaseUnit("");
			setNewIngredientCostPerUnit("");
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

		const costPerUnit = Number(newIngredientCostPerUnit);

		if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
			setFormError("Please enter a valid non-negative cost per unit.");
			return;
		}

		createIngredientMutation.mutate({
			name: newIngredientName.trim(),
			purchaseUnit: newIngredientPurchaseUnit.trim(),
			costPerUnit,
		});
	}

	return (
		<>
			<h1>{INGREDIENTS_PAGE_HEADING}</h1>
			<div className="flex flex-col gap-4 mb-8">
				<ul className="flex flex-row justify-center">
					<li>
						<Button type="button" variant="outline" onClick={onAddIngredient}>
							{addIngredientUIOpen ? <Minus /> : <Plus />}
							<span>{addIngredientUIOpen ? "Close" : "Add ingredient"}</span>
						</Button>
					</li>
				</ul>
				{addIngredientUIOpen && (
					<IngredientForm
						label={CREATE_INGREDIENT_FORM_LABEL}
						onSubmit={onCreateIngredient}
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
			<div>
				{isIngredientsPending ? (
					<p>{GENERIC_LOADING}</p>
				) : ingredientsError ? (
					<InlineError alert>{getErrorMessage(ingredientsError)}</InlineError>
				) : ingredients.length === 0 ? (
					<p>No ingredients yet.</p>
				) : (
					<ul>
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
