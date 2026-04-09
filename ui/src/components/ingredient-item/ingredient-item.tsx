import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, X, Trash2 } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item/item";
import {
	EDIT_INGREDIENT_FORM_LABEL,
	GENERIC_ERROR,
	INGREDIENT_ITEM_DELETE_BUTTON_LABEL,
	INGREDIENT_ITEM_EDIT_BUTTON_LABEL,
	NETWORK_ERROR,
} from "@/lib/content-strings";
import type {
	CreateIngredientPayload,
	Ingredient,
	IngredientMutationResponse,
} from "@/lib/types/ingredient";
import { Button } from "../ui/button/button";
import { IngredientForm } from "../ingredient-form/ingredient-form";

type IngredientItemProps = Pick<Ingredient, "id" | "name" | "purchaseUnit" | "costPerUnit">;

type UpdateIngredientPayload = {
	id: string;
} & Partial<CreateIngredientPayload>;

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

function getErrorMessage(error: unknown) {
	if (error instanceof TypeError) {
		return NETWORK_ERROR;
	}

	return error instanceof Error ? error.message : GENERIC_ERROR;
}

async function updateIngredient({ id, ...payload }: UpdateIngredientPayload) {
	const response = await fetch(`${apiBaseUrl}/ingredients/${id}`, {
		method: "PATCH",
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

async function deleteIngredient({ id }: { id: string }) {
	const response = await fetch(`${apiBaseUrl}/ingredients/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	const data = (await response.json().catch(() => null)) as IngredientMutationResponse | null;

	if (!response.ok) {
		throw new Error(data?.message ?? GENERIC_ERROR);
	}

	return data;
}

export function IngredientItem({ id, name, purchaseUnit, costPerUnit }: IngredientItemProps) {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(name);
	const [newPurchaseUnit, setNewPurchaseUnit] = useState(purchaseUnit);
	const [newCostPerUnit, setNewCostPerUnit] = useState(costPerUnit);
	const [formError, setFormError] = useState<string | null>(null);

	const updateIngredientMutation = useMutation({
		mutationFn: updateIngredient,
		onSuccess: async () => {
			setFormError(null);
			setIsEditing(false);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});

	const deleteIngredientMutation = useMutation({
		mutationFn: deleteIngredient,
		onSuccess: async () => {
			setFormError(null);
			await queryClient.invalidateQueries({ queryKey: ["ingredients"] });
		},
		onError: (error) => {
			setFormError(getErrorMessage(error));
		},
	});

	function onEdit() {
		setNewName(name);
		setNewPurchaseUnit(purchaseUnit);
		setNewCostPerUnit(costPerUnit);
		setFormError(null);
		setIsEditing(true);
	}

	function onCancel() {
		setFormError(null);
		setIsEditing(false);
	}

	function onDelete(event: React.MouseEvent) {
		event.preventDefault();
		setFormError(null);

		if (
			!window.confirm(
				"Are you sure you want to delete this ingredient? This action cannot be undone.",
			)
		) {
			return;
		}

		deleteIngredientMutation.mutate({ id });
	}

	function onEditSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		setFormError(null);

		const trimmedName = newName.trim();
		const trimmedPurchaseUnit = newPurchaseUnit.trim();
		const parsedCostPerUnit = Number(newCostPerUnit);
		const originalCostPerUnit = Number(costPerUnit);

		if (!trimmedName) {
			setFormError("Name is required.");
			return;
		}

		if (!trimmedPurchaseUnit) {
			setFormError("Please select a purchase unit.");
			return;
		}

		if (!Number.isFinite(parsedCostPerUnit) || parsedCostPerUnit < 0) {
			setFormError("Please enter a valid non-negative cost per unit.");
			return;
		}

		const payload: UpdateIngredientPayload = { id };

		if (trimmedName !== name) {
			payload.name = trimmedName;
		}

		if (trimmedPurchaseUnit !== purchaseUnit) {
			payload.purchaseUnit = trimmedPurchaseUnit;
		}

		if (parsedCostPerUnit !== originalCostPerUnit) {
			payload.costPerUnit = parsedCostPerUnit;
		}

		if (Object.keys(payload).length === 1) {
			setIsEditing(false);
			return;
		}

		updateIngredientMutation.mutate(payload);
	}

	return (
		<div className="flex flex-col gap-2 mb-2">
			<Item data-testid="ingredient-item" size="sm" variant="outline" className="p-1.5">
				<ItemContent className="flex flex-row justify-between">
					{isEditing ? (
						<IngredientForm
							label={EDIT_INGREDIENT_FORM_LABEL}
							isEdit
							submitHandler={onEditSubmit}
							name={newName}
							setName={setNewName}
							purchaseUnit={newPurchaseUnit}
							setPurchaseUnit={setNewPurchaseUnit}
							costPerUnit={newCostPerUnit}
							setCostPerUnit={setNewCostPerUnit}
							mutation={updateIngredientMutation}
							formError={formError}
							setFormError={setFormError}
						/>
					) : (
						<>
							<ItemTitle className="pl-2">{name}</ItemTitle>
							<div className="flex flex-row gap-1">
								<span className="">{costPerUnit}</span>
								<span>/</span>
								<span>{purchaseUnit.toLocaleLowerCase()}</span>
							</div>
						</>
					)}
				</ItemContent>
				<ItemActions>
					<Button type="button" variant="outline" onClick={isEditing ? onCancel : onEdit}>
						{isEditing ? <X /> : <Pencil />}
						<span className="sr-only">{INGREDIENT_ITEM_EDIT_BUTTON_LABEL}</span>
					</Button>
					<Button type="button" variant="outline" onClick={onDelete}>
						<Trash2 />
						<span className="sr-only">{INGREDIENT_ITEM_DELETE_BUTTON_LABEL}</span>
					</Button>
				</ItemActions>
			</Item>
		</div>
	);
}
