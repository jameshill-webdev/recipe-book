import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { IngredientItem } from "@/components/ingredient-item/ingredient-item";
import { Button } from "@/components/ui/button/button";
import { InlineError } from "@/components/ui/error/error";
import { Field, FieldLabel } from "@/components/ui/field/field";
import { Input } from "@/components/ui/input/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select/select";
import {
	CREATE_INGREDIENT_FORM_LABEL,
	GENERIC_ERROR,
	GENERIC_LOADING,
	INGREDIENTS_PAGE_HEADING,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import { PURCHASE_UNITS } from "@recipe-book/shared/lib/purchase-units";

type Ingredient = {
	id: string;
	name: string;
	purchaseUnit: string;
	costPerUnit: number | string;
};

type CreateIngredientPayload = {
	name: string;
	purchaseUnit: string;
	costPerUnit: number;
};

type CreateIngredientResponse = {
	ok: boolean;
	message?: string;
	ingredient?: Ingredient;
};

type GetIngredientsResponse = {
	ok: boolean;
	message?: string;
	ingredients?: Ingredient[];
};

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

	const data = (await response.json().catch(() => null)) as CreateIngredientResponse | null;

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
	const [newIngredientCostPerUnit, setNewIngredientCostPerUnit] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
			setSuccessMessage("Ingredient created successfully.");
			setAddIngredientUIOpen(false);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setSuccessMessage(null);
			setFormError(getErrorMessage(error));
		},
	});

	function onAddIngredient() {
		setAddIngredientUIOpen((prev) => !prev);
	}

	function onCreateIngredient(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);
		setSuccessMessage(null);

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
							<span>Add ingredient</span>
						</Button>
					</li>
				</ul>
				{successMessage && <p role="status">{successMessage}</p>}
				{addIngredientUIOpen && (
					<form
						onSubmit={onCreateIngredient}
						className="mx-auto w-full mt-4 flex flex-col gap-6 justify-start items-start md:grid md:grid-cols-[4fr_2fr_1fr_1fr] md:items-end"
						aria-label={CREATE_INGREDIENT_FORM_LABEL}
					>
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								type="text"
								autoComplete="off"
								value={newIngredientName}
								onChange={(e) => {
									setNewIngredientName(e.target.value);
									setFormError(null);
								}}
								placeholder="Name"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="purchaseUnit">Purchase unit</FieldLabel>
							<Select
								value={newIngredientPurchaseUnit}
								onValueChange={(value) => {
									setNewIngredientPurchaseUnit(value);
									setFormError(null);
								}}
								required
							>
								<SelectTrigger id="purchaseUnit" className="w-full max-w-48">
									<SelectValue placeholder="Select a unit" />
								</SelectTrigger>
								<SelectContent>
									{PURCHASE_UNITS.map((unit) => (
										<SelectItem key={unit} value={unit}>
											{unit.toLocaleLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel htmlFor="costPerUnit">Cost per unit</FieldLabel>
							<Input
								id="costPerUnit"
								type="number"
								autoComplete="off"
								inputMode="decimal"
								min="0"
								step="0.01"
								value={newIngredientCostPerUnit}
								onChange={(e) => {
									setNewIngredientCostPerUnit(e.target.value);
									setFormError(null);
								}}
								placeholder="Cost per unit"
								required
							/>
						</Field>
						<Field>
							<Button
								type="submit"
								className="mt-4"
								disabled={createIngredientMutation.isPending}
							>
								{createIngredientMutation.isPending
									? "Creating..."
									: "Create ingredient"}
							</Button>
						</Field>
						{formError && <InlineError alert>{formError}</InlineError>}
					</form>
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
								<IngredientItem
									name={ingredient.name}
									purchaseUnit={ingredient.purchaseUnit.toLocaleLowerCase()}
									costPerUnit={ingredient.costPerUnit}
								/>
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
